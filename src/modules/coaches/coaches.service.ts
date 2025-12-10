import { query } from "../../config/db";

export const getAllCoachesService = async () => {
  const result = await query("SELECT * from coaches");
  return result.rows;
};
