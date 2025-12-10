import { Router } from "express";
import {
  createCoachController,
  createCourtsController,
  createEquipmentsController,
} from "./admin.controller";

const router = Router();

router.post("/equipments", createEquipmentsController);
router.post("/courts", createCourtsController);
router.post("/coaches", createCoachController);
export default router;
