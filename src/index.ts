import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import courtsRouter from "./modules/courts/courts.routes";
import equipmentsRouter from "./modules/equipment/equipment.routes";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;

app.get("/health", (req: Request, res: Response) =>
  res.json({
    status: "ok",
  })
);

app.use("/api/courts", courtsRouter);
app.use("/api/equipments", equipmentsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
