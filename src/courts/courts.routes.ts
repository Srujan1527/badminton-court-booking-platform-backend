import express from "express";
import {
  createCourtsController,
  getAllCourtsByIdController,
  getAllCourtsController,
} from "./courts.controller";

const router = express.Router();

router.get("/", getAllCourtsController);
router.get("/:id", getAllCourtsByIdController);
router.post("/admin/courts", createCourtsController);

export default router;
