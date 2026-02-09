import { Router } from "express";
import {
  createOutlet,
  getOutlets,
  getOutletStocks,
  deleteOutlet,
} from "../controllers/outlet.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.get("/", getOutlets);
router.post("/", createOutlet);
router.delete("/:id", deleteOutlet);
router.get("/:outlet_id/stocks", getOutletStocks);

export default router;
