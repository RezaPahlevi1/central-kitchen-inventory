import { Router } from "express";
import {
  createOutlet,
  getOutlets,
  getOutletStocks,
  deleteOutlet,
} from "../controllers/outlet.controller.js";

const router = Router();

router.get("/", getOutlets);
router.post("/", createOutlet);
router.delete("/:id", deleteOutlet);
router.get("/:outlet_id/stocks", getOutletStocks);

export default router;
