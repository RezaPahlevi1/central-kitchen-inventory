import { Router } from "express";
import {
  getOutlets,
  getOutletStocks,
} from "../controllers/outlet.controller.js";

const router = Router();

router.get("/", getOutlets);
router.get("/:outlet_id/stocks", getOutletStocks);

export default router;
