import { Router } from "express";
import {
  getStockMovements,
  getOutletMovements,
  transferStock,
} from "../controllers/stockMovement.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/transfer", transferStock);

router.get("/", getStockMovements);

router.get("/outlet", getOutletMovements);

export default router;
