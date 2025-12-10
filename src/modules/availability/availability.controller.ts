import type { Request, Response } from "express";
import { getAllAvailableItemsService } from "./availability.service";

export const getAvailabilityController = async (
  req: Request,
  res: Response
) => {
  try {
    const { startTime, endTime } = req.query;
    console.log({ startTime, endTime });
    if (!startTime || !endTime) {
      return res
        .status(400)
        .json({ message: "startTime and endTime are required" });
    }

    const start = new Date(String(startTime));
    const end = new Date(String(endTime));
    console.log({ start, end });
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "startTime and endTime must be valid dates" });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "startTime must be earlier than endTime",
      });
    }

    const data = await getAllAvailableItemsService(start, end);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in getAvailabilityController:", error);
    return res.status(500).json({ message: "Failed to fetch availability" });
  }
};
