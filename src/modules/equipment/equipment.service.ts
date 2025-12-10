import { query } from "../../config/db";
import { Equipments } from "./equipment.controller";

export const getAllEquipmentsService = async () => {
  const result = await query("SELECT * from equipment_types ");
  return result.rows;
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
