import {
  createCoachService,
  createCourtsService,
  createEquipmentsService,
} from "./admin.service";
import type { Request, Response } from "express";

export interface Courts {
  name: string;
  is_indoor: boolean;
  base_hourly_rate: number;
  is_active: boolean;
}

export interface Equipments {
  name: string;
  total_quantity: number;
  price_per_unit: string;
  is_active: boolean;
}

export interface Coach {
  name: string;
  bio: string;
  hourly_rate: string;
  is_active: boolean;
}

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

export const createCoachController = async (req: Request, res: Response) => {
  try {
    const { name, bio, hourly_rate, is_active } = req.body;

    await createCoachService({ name, bio, hourly_rate, is_active });
    res.status(200).json({ message: "Coach has been created Successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};
