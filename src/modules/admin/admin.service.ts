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
