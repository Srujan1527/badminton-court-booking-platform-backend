import type { Request, Response } from "express";
import {
  createEquipmentsService,
  getAllEquipmentsService,
} from "./equipment.service";

export interface Equipments {
  name: string;
  total_quantity: number;
  price_per_unit: string;
  is_active: boolean;
}

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

export const createEquipmentsController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, total_quantity, price_per_unit, is_active } = req.body;

    await createEquipmentsService({
      name,
      total_quantity,
      price_per_unit,
      is_active,
    });
    res
      .status(200)
      .json({ message: "Equipment has been created Successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
