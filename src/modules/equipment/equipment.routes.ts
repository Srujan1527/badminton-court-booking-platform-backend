import express from "express";
import {
  createEquipmentsController,
  getAllEquipmentsController,
} from "./equipment.controller";

const router = express.Router();

router.get("/", getAllEquipmentsController);
router.post("/admin/equipments", createEquipmentsController);
export default router;
