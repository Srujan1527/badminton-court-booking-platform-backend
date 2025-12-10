import { query } from "../../config/db";

export type AvailabilityResult = {
  courts: {
    id: number;
    name: string;
    isIndoor: boolean;
    baseHourlyRate: number;
    isAvailable: boolean;
  }[];
  equipment: {
    id: number;
    name: string;
    availableQuantity: number;
    pricePerUnit: number;
  }[];
  coaches: {
    id: number;
    name: string;
    hourlyRate: number;
    isAvailable: boolean;
  }[];
};

export const getAllAvailableItemsService = async (
  startTime: Date,
  endTime: Date
): Promise<AvailabilityResult> => {
  const [courtsRes, equipment_typesRes, coachesRes] = await Promise.all([
    query(`SELECT * from courts WHERE is_active=true`),
    query(`SELECT * from equipment_types WHERE is_active=true`),
    query(`SELECT * from coaches WHERE is_active=true`),
  ]);

  const courts = courtsRes.rows;
  const equipmentTypes = equipment_typesRes.rows;
  const coaches = coachesRes.rows;

  const overlappingRes = await query(
    ` 
    SELECT b.id as booking_id, b.court_id , be.equipment_type_id, be.quantity ,bc.coach_id FROM bookings b 
    LEFT JOIN booking_equipments be ON be.booking_id= b.id
    LEFT JOIN booking_coaches bc ON bc.booking_id = b.id 
    WHERE b.status = 'CONFIRMED'
    AND b.start_time < $2 
    AND b.end_time>$1
    
    `,
    [startTime, endTime]
  );

  const overlapping = overlappingRes.rows;

  const busyCourtIds = new Set<number>();

  for (const row of overlapping) {
    if (row.court_id !== null) {
      busyCourtIds.add(Number(row.court_id));
    }
  }

  const courtAvailability = courts.map((c: any) => ({
    id: c.id,
    name: c.name,
    isIndoor: c.is_indoor,
    baseHourlyRate: Number(c.base_hourly_rate),
    isAvailable: !busyCourtIds.has(c.id),
  }));

  ///----------equipments Availability -----------

  const equipmentsUsage: Record<number, number> = {};

  for (const row of overlapping) {
    if (row.equipment_type_id !== null) {
      const eqId = Number(row.equipment_type_id);
      const qty = Number(row.quantity || 0);
      equipmentsUsage[eqId] = (equipmentsUsage[eqId] || 0) + qty;
    }
  }

  const equipmentsAvailability = equipmentTypes.map((e: any) => {
    const used = equipmentsUsage[e.id] || 0;
    const available = Math.max(Number(e.total_quantity) - used, 0);
    return {
      id: e.id,
      name: e.name,
      availableQuantity: available,
      pricePerUnit: Number(e.price_per_unit),
    };
  });

  const busyCoachIds = new Set<number>();

  for (let row of overlapping) {
    if (row.coach_id !== null) {
      busyCoachIds.add(Number(row.coach_id));
    }
  }

  const dayOfWeek = startTime.getDay();
  const hour = startTime.getHours();

  const availableRes = await query(
    `
    SELECT coach_id from coach_availabilities
     WHERE day_of_week =$1
     AND start_hour<=$2 
     AND end_hour >=$3 
    
    `,
    [dayOfWeek, hour, hour + 1]
  );

  const workingCoachIds = new Set<number>(
    availableRes.rows.map((r: any) => Number(r.coach_id))
  );

  const coachAvailability = coaches.map((c: any) => {
    const isWorking = workingCoachIds.has(c.id);
    const isBusy = busyCoachIds.has(c.id);
    const isAvailable = isWorking && !isBusy;

    return {
      id: c.id,
      name: c.name,
      hourlyRate: Number(c.hourly_rate),
      isAvailable,
    };
  });
  return {
    courts: courtAvailability,
    equipment: equipmentsAvailability,
    coaches: coachAvailability,
  };
};
