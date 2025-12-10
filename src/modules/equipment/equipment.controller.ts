import type { Request, Response } from "express";
import { getAllEquipmentsService } from "./equipment.service";

export const getAllEquipmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getAllEquipmentsService();
    res.status(200).json({ data });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
