import { query } from "../../config/db";
import { Courts } from "./courts.controller";

export const getAllCourtsService = async () => {
  const result = await query("SELECT * from courts ");
  return result.rows;
};

export const getAllCourtsByIdService = async (id: number) => {
  const result = await query("SELECT * from courts where id=$1 ", [id]);
  return result.rows;
};

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
