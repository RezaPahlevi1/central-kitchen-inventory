import { Router } from "express";
import {
  getStockMovements, // Existing (CK)
  getOutletMovements, // NEW (Pastikan function ini sudah ada di controller)
  transferStock,
} from "../controllers/stockMovement.controller.js";

const router = Router();

router.post("/transfer", transferStock);

// Endpoint untuk Central Kitchen (Default)
router.get("/", getStockMovements);

// Endpoint BARU untuk Outlet
router.get("/outlet", getOutletMovements);

export default router;
