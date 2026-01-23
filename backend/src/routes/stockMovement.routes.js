import { Router } from "express";
import {
  getStockMovements,
  transferStock,
} from "../controllers/stockMovement.controller.js";

const router = Router();

router.post("/transfer", transferStock);
router.get("/", getStockMovements);

export default router;
