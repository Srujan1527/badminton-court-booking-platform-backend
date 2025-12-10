import { query } from "../../config/db";
import { Coach, Courts, Equipments } from "./admin.controller";

export const createCourtsService = async ({
  name,
  is_indoor,
  base_hourly_rate,
  is_active,
}: Courts) => {
  const result = await query(
    "INSERT INTO courts (name,is_indoor,base_hourly_rate,is_active) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, is_indoor, base_hourly_rate, is_active]
  );
  return result.rows[0];
};

export const createEquipmentsService = async ({
  name,
  total_quantity,
  price_per_unit,
  is_active,
}: Equipments) => {
  const result = await query(
    "INSERT INTO equipment_types (name,total_quantity,price_per_unit,is_active) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, total_quantity, price_per_unit, is_active]
  );
  return result.rows[0];
};

export const createCoachService = async ({
  name,
  bio,
  hourly_rate,
  is_active,
}: Coach) => {
  const result = await query(
    "INSERT INTO coaches (name, bio, hourly_rate, is_active) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, bio, hourly_rate, is_active]
  );
  return result.rows[0];
};

export type SlotInput = {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
};

export const setCoachAvailabilityService = async (
  coachId: number,
  slots: SlotInput[]
) => {
  try {
    const coachRes = await query(
      "SELECT id FROM coaches WHERE id = $1 AND is_active = true",
      [coachId]
    );

    if (coachRes.rowCount === 0) {
      const error: any = new Error("Coach not found or inactive");
      error.code = "COACH_NOT_FOUND";
      throw error;
    }

    await query("DELETE FROM coach_availabilities WHERE coach_id = $1", [
      coachId,
    ]);

    // 3. Insert new slots
    const insertText = `
      INSERT INTO coach_availabilities (coach_id, day_of_week, start_hour, end_hour)
      VALUES ($1, $2, $3, $4)
      RETURNING id, coach_id, day_of_week, start_hour, end_hour
    `;

    const inserted: any[] = [];

    for (const slot of slots) {
      const result = await query(insertText, [
        coachId,
        slot.dayOfWeek,
        slot.startHour,
        slot.endHour,
      ]);
      inserted.push(result.rows[0]);
    }

    await query("COMMIT");
    return inserted;
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
};
