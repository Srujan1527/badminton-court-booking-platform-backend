import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const DB_URL = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: DB_URL,
});

// it is a helper function
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};
