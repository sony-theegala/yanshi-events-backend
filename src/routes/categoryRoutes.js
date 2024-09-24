import { Router } from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = Router();

router.post("/", createCategory);
router.get("/", getCategories);
router.delete("/:id", deleteCategory);

export default router;
