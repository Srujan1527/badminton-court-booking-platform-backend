// src/modules/bookings/booking.service.ts

import { query } from "../../config/db";
import {
  calculateBookingPrice,
  getActivePricingRulesService,
  EquipmentSelection,
} from "./pricing";

type CreateBookingInput = {
  userName: string;
  userEmail: string;
  start: Date;
  end: Date;
  courtId: number;
  equipment: { equipmentTypeId: number; quantity: number }[];
  coachId: number | null;
};

export const createBookingService = async (input: CreateBookingInput) => {
  try {
    await query("BEGIN");

    const { userName, userEmail, start, end, courtId, equipment, coachId } =
      input;

    // 1) Load court, equipment, coach (and validate existence)
    const courtRes = await query(
      "SELECT * FROM courts WHERE id = $1 AND is_active = true",
      [courtId]
    );
    if (courtRes.rowCount === 0) {
      const err: any = new Error("Court not found or inactive");
      err.code = "NOT_FOUND";
      throw err;
    }
    const court = courtRes.rows[0];

    // Load all equipment rows for requested equipment
    const equipmentIds = equipment.map((e) => e.equipmentTypeId);
    const equipmentRowsRes =
      equipmentIds.length > 0
        ? await query(
            `
            SELECT *
            FROM equipment_types
            WHERE id = ANY($1::int[])
          `,
            [equipmentIds]
          )
        : { rows: [] as any[] };

    // Map for quick lookup
    const equipmentById = new Map<number, any>();
    for (const row of equipmentRowsRes.rows) {
      equipmentById.set(row.id, row);
    }

    // Validate requested equipment exists
    for (const item of equipment) {
      if (!equipmentById.has(item.equipmentTypeId)) {
        const err: any = new Error(
          `Equipment type ${item.equipmentTypeId} not found`
        );
        err.code = "NOT_FOUND";
        throw err;
      }
    }

    // Load coach row if coachId provided
    let coach: any = null;
    if (coachId !== null) {
      const coachRes = await query(
        "SELECT * FROM coaches WHERE id = $1 AND is_active = true",
        [coachId]
      );
      if (coachRes.rowCount === 0) {
        const err: any = new Error("Coach not found or inactive");
        err.code = "NOT_FOUND";
        throw err;
      }
      coach = coachRes.rows[0];
    }

    // 2) Check overlapping bookings for same time range
    const overlappingRes = await query(
      `
      SELECT 
        b.id AS booking_id,
        b.court_id,
        be.equipment_type_id,
        be.quantity,
        bc.coach_id
      FROM bookings b
      LEFT JOIN booking_equipments be ON be.booking_id = b.id
      LEFT JOIN booking_coaches bc ON bc.booking_id = b.id
      WHERE b.status = 'CONFIRMED'
        AND b.start_time < $2
        AND b.end_time   > $1
      `,
      [start, end]
    );
    const overlapping = overlappingRes.rows;

    // ---------- Court availability ----------
    const courtBusy = overlapping.some(
      (row) => Number(row.court_id) === courtId
    );
    if (courtBusy) {
      const err: any = new Error("Court is not available for this time slot");
      err.code = "COURT_UNAVAILABLE";
      throw err;
    }

    // ---------- Equipment availability ----------
    const equipmentUsage: Record<number, number> = {};
    for (const row of overlapping) {
      if (row.equipment_type_id != null) {
        const eqId = Number(row.equipment_type_id);
        const qty = Number(row.quantity || 0);
        equipmentUsage[eqId] = (equipmentUsage[eqId] || 0) + qty;
      }
    }

    for (const item of equipment) {
      const eqRow = equipmentById.get(item.equipmentTypeId)!;
      const alreadyUsed = equipmentUsage[item.equipmentTypeId] || 0;
      const total = Number(eqRow.total_quantity);
      const remaining = total - alreadyUsed;

      if (item.quantity > remaining) {
        const err: any = new Error(
          `Not enough ${eqRow.name} available. Requested ${item.quantity}, only ${remaining} left`
        );
        err.code = "EQUIPMENT_UNAVAILABLE";
        throw err;
      }
    }

    // ---------- Coach availability ----------
    if (coachId !== null) {
      // Is coach already booked in overlapping bookings?
      const coachBusy = overlapping.some(
        (row) => row.coach_id != null && Number(row.coach_id) === coachId
      );
      if (coachBusy) {
        const err: any = new Error("Coach is already booked for this slot");
        err.code = "COACH_UNAVAILABLE";
        throw err;
      }

      // Is coach working at this time according to coach_availabilities?
      const dayOfWeek = start.getDay();
      const hour = start.getHours();
      const availRes = await query(
        `
        SELECT 1
        FROM coach_availabilities
        WHERE coach_id = $1
          AND day_of_week = $2
          AND start_hour <= $3
          AND end_hour   >= $4
        `,
        [coachId, dayOfWeek, hour, hour + 1]
      );

      if (availRes.rowCount === 0) {
        const err: any = new Error(
          "Coach is not available at this day/time per schedule"
        );
        err.code = "COACH_UNAVAILABLE";
        throw err;
      }
    }

    // 3) Pricing
    const pricingRules = await getActivePricingRulesService();

    const equipmentForPricing: EquipmentSelection[] = equipment.map((item) => {
      const row = equipmentById.get(item.equipmentTypeId)!;
      return {
        equipmentTypeId: item.equipmentTypeId,
        quantity: item.quantity,
        pricePerUnit: Number(row.price_per_unit),
      };
    });

    const priceBreakdown = calculateBookingPrice(
      start,
      end,
      {
        base_hourly_rate: Number(court.base_hourly_rate),
        is_indoor: court.is_indoor,
      },
      equipmentForPricing,
      coach
        ? {
            hourly_rate: Number(coach.hourly_rate),
          }
        : null,
      pricingRules
    );

    const totalPrice = priceBreakdown.total;

    // 4) Insert into bookings
    const bookingRes = await query(
      `
      INSERT INTO bookings
        (user_name, user_email, start_time, end_time, court_id, total_price, status, created_at, updated_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, 'CONFIRMED', NOW(), NOW())
      RETURNING id
      `,
      [userName, userEmail, start, end, courtId, totalPrice]
    );

    const bookingId = bookingRes.rows[0].id;

    // 5) Insert equipment rows
    for (const item of equipment) {
      const eqRow = equipmentById.get(item.equipmentTypeId);
      const pricePerUnit = Number(eqRow.price_per_unit);
      await query(
        `
        INSERT INTO booking_equipments
          (booking_id, equipment_type_id, quantity,price)
        VALUES ($1, $2, $3,$4)
        `,
        [bookingId, item.equipmentTypeId, item.quantity, pricePerUnit]
      );
    }

    // 6) Insert coach row if any
    if (coachId !== null) {
      await query(
        `
        INSERT INTO booking_coaches
          (booking_id, coach_id,price)
        VALUES ($1, $2,$3)
        `,
        [bookingId, coachId, priceBreakdown.baseCoach]
      );
    }

    await query("COMMIT");

    return {
      bookingId,
      totalPrice,
      priceBreakdown,
    };
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
};
