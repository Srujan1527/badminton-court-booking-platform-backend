import { Router } from "express";
import { getAllCoachesController } from "./coaches.controller";

const router = Router();

router.get("/", getAllCoachesController);

export default router;
