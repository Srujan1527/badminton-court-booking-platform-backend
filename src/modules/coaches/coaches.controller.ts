import type { Request, Response } from "express";
import { getAllCoachesService } from "./coaches.service";

//TODO: add all edge cases so that it should return error if any thing fails

export const getAllCoachesController = async (req: Request, res: Response) => {
  try {
    const data = await getAllCoachesService();
    res.status(200).json({ data });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
