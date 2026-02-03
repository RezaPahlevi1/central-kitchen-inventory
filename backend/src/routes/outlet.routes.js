import { Router } from "express";
import {
  createOutlet,
  getOutlets,
  getOutletStocks,
} from "../controllers/outlet.controller.js";

const router = Router();

router.get("/", getOutlets);
router.post("/", createOutlet);
router.get("/:outlet_id/stocks", getOutletStocks);

export default router;
