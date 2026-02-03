import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/all", getAllProducts);
router.post("/", createProduct);
router.get("/", getProducts);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
