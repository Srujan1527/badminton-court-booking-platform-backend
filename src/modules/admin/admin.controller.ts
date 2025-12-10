import {
  createCoachService,
  createCourtsService,
  createEquipmentsService,
  setCoachAvailabilityService,
  SlotInput,
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

export const setCoachAvailabilityController = async (
  req: Request,
  res: Response
) => {
  try {
    const coachId = Number(req.params.id);
    const { slots } = req.body as { slots: SlotInput[] };

    if (!coachId || Number.isNaN(coachId)) {
      return res.status(400).json({ message: "Invalid coach id" });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res
        .status(400)
        .json({ message: "slots must be a non-empty array" });
    }

    for (const slot of slots) {
      if (
        typeof slot.dayOfWeek !== "number" ||
        typeof slot.startHour !== "number" ||
        typeof slot.endHour !== "number"
      ) {
        return res.status(400).json({
          message:
            "Each slot must have numeric dayOfWeek, startHour and endHour",
        });
      }

      if (slot.startHour < 0 || slot.startHour > 23) {
        return res
          .status(400)
          .json({ message: "startHour must be between 0 and 23" });
      }
      if (slot.endHour < 1 || slot.endHour > 24) {
        return res
          .status(400)
          .json({ message: "endHour must be between 1 and 24" });
      }
      if (slot.startHour >= slot.endHour) {
        return res.status(400).json({
          message: "startHour must be less than endHour for each slot",
        });
      }
      if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
        return res
          .status(400)
          .json({ message: "dayOfWeek must be between 0 and 6" });
      }
    }

    const availability = await setCoachAvailabilityService(coachId, slots);

    return res.status(200).json({
      coachId,
      availability,
    });
  } catch (error: any) {
    console.error("Error in setCoachAvailabilityController:", error);
    if (error.code === "COACH_NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: "Failed to set coach availability" });
  }
};
