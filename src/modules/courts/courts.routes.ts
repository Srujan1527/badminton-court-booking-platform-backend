import express from "express";
import {
  getAllCourtsByIdController,
  getAllCourtsController,
} from "./courts.controller";

const router = express.Router();

router.get("/", getAllCourtsController);
router.get("/:id", getAllCourtsByIdController);

export default router;
