import { Router } from "express";
import {
  getStockMovements,
  getOutletMovements,
  transferStock,
} from "../controllers/stockMovement.controller.js";

const router = Router();

router.post("/transfer", transferStock);

router.get("/", getStockMovements);

router.get("/outlet", getOutletMovements);

export default router;
