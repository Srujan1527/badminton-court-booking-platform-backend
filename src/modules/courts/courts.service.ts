import { query } from "../../config/db";

export const getAllCourtsService = async () => {
  const result = await query("SELECT * from courts ");
  return result.rows;
};

export const getAllCourtsByIdService = async (id: number) => {
  const result = await query("SELECT * from courts where id=$1 ", [id]);
  return result.rows;
};
