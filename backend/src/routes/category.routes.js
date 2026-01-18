import { Router } from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryProducts,
} from "../controllers/category.controller.js";

const router = Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/:id/products", getCategoryProducts);

export default router;
