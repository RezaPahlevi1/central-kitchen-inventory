import express from "express";
import {
  getAllStaff,
  addStaff,
  deleteStaff,
  toggleStaffStatus,
} from "../controllers/user.controller.js";
import { verifyToken, verifySuperadmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply middleware globally for this router
router.use(verifyToken);
router.use(verifySuperadmin);

router.get("/", getAllStaff);
router.post("/", addStaff);
router.delete("/:id", deleteStaff);
router.patch("/:id/status", toggleStaffStatus);

export default router;
