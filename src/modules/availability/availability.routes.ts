import { Router } from "express";
import { getAvailabilityController } from "./availability.controller";

const router = Router();

router.get("/", getAvailabilityController);

export default router;
