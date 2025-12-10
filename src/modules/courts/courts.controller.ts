import type { Request, Response } from "express";

import { getAllCourtsByIdService, getAllCourtsService } from "./courts.service";

export const getAllCourtsController = async (req: Request, res: Response) => {
  try {
    const data = await getAllCourtsService();
    res.status(200).json({ data });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const getAllCourtsByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const newId = Number(id);
    const data = await getAllCourtsByIdService(newId);
    res.status(200).json({ data });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
