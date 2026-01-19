import { Router } from "express";
import { getLowStock } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", getLowStock);

export default router;
