import { Router } from "express";
import { transferStock } from "../controllers/stockMovement.controller.js";

const router = Router();

router.post("/transfer", transferStock);

export default router;
