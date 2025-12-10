import { query } from "../../config/db";

export const getAllEquipmentsService = async () => {
  const result = await query("SELECT * from equipment_types ");
  return result.rows;
};
