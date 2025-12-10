import { Router } from "express";
import {
  createCoachController,
  createCourtsController,
  createEquipmentsController,
  setCoachAvailabilityController,
} from "./admin.controller";

const router = Router();

router.post("/equipments", createEquipmentsController);
router.post("/courts", createCourtsController);
router.post("/coaches", createCoachController);
router.post("/coaches/:id/availability", setCoachAvailabilityController);
export default router;
