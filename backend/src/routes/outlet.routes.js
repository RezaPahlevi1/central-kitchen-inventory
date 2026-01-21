import { Router } from "express";
import { getOutlets } from "../controllers/outlet.controller.js";

const router = Router();

router.get("/", getOutlets);

export default router;
