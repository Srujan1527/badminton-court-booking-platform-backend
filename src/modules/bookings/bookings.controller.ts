// src/modules/bookings/booking.controller.ts
import { Request, Response } from "express";
import { createBookingService } from "./bookings.service";

export const createBookingController = async (req: Request, res: Response) => {
  try {
    const {
      userName,
      userEmail,
      startTime,
      endTime,
      courtId,
      equipment, // [{ equipmentTypeId, quantity }]
      coachId,
    } = req.body;

    if (!userName || typeof userName !== "string") {
      return res.status(400).json({ message: "userName is required" });
    }
    if (!userEmail || typeof userEmail !== "string") {
      return res.status(400).json({ message: "userEmail is required" });
    }
    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "startTime and endTime are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "startTime and endTime must be valid dates" });
    }
    if (start >= end) {
      return res
        .status(400)
        .json({ message: "startTime must be earlier than endTime" });
    }

    if (!courtId || typeof courtId !== "number") {
      return res.status(400).json({ message: "courtId must be a number" });
    }

    if (equipment && !Array.isArray(equipment)) {
      return res
        .status(400)
        .json({ message: "equipment must be an array if provided" });
    }

    // basic equipment validation
    const safeEquipment =
      equipment?.map((item: any) => ({
        equipmentTypeId: Number(item.equipmentTypeId),
        quantity: Number(item.quantity),
      })) ?? [];

    for (const item of safeEquipment) {
      if (!item.equipmentTypeId || item.quantity <= 0) {
        return res.status(400).json({
          message:
            "Each equipment item must have equipmentTypeId and positive quantity",
        });
      }
    }

    const safeCoachId =
      coachId !== undefined && coachId !== null ? Number(coachId) : null;

    const booking = await createBookingService({
      userName,
      userEmail,
      start,
      end,
      courtId,
      equipment: safeEquipment,
      coachId: safeCoachId,
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    console.error("Error in createBookingController:", error);

    if (error.code === "COURT_UNAVAILABLE") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "EQUIPMENT_UNAVAILABLE") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "COACH_UNAVAILABLE") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to create booking" });
  }
};
