import type { Request, Response } from "express";

import {
  createCourtsService,
  getAllCourtsByIdService,
  getAllCourtsService,
} from "./courts.service";

export interface Courts {
  name: string;
  is_indoor: boolean;
  base_hourly_rate: number;
  is_active: boolean;
}
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

export const createCourtsController = async (req: Request, res: Response) => {
  try {
    const { name, is_indoor, base_hourly_rate, is_active }: Courts = req.body;

    await createCourtsService({
      name,
      is_indoor,
      base_hourly_rate,
      is_active,
    });
    res.status(200).json({ message: "Court has been created Successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
