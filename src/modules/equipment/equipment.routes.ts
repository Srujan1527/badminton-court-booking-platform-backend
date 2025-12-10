import express from "express";
import { getAllEquipmentsController } from "./equipment.controller";

const router = express.Router();

router.get("/", getAllEquipmentsController);

export default router;
