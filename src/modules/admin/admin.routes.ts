import { Router } from "express";
import {
  createCoachController,
  createCourtsController,
  createEquipmentsController,
  createPricingRuleController,
  getAllPricingRulesController,
  setCoachAvailabilityController,
} from "./admin.controller";

const router = Router();

router.post("/equipments", createEquipmentsController);
router.post("/courts", createCourtsController);
router.post("/coaches", createCoachController);
router.post("/coaches/:id/availability", setCoachAvailabilityController);
router.post("/pricing-rules", createPricingRuleController);
router.get("/pricing-rules", getAllPricingRulesController);
export default router;
