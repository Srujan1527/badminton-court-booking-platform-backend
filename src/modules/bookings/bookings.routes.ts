// src/modules/bookings/booking.route.ts
import { Router } from "express";
import { createBookingController } from "./bookings.controller";

const router = Router();

// Create a booking
router.post("/", createBookingController);

export default router;
