import { Router } from "express";
import {
  createSubcategory,
  getSubcategories,
  deleteSubcategory,
  getSubcategoriesByCategoryId,
} from "../controllers/subcategoryController.js";

const router = Router();

router.post("/", createSubcategory);
router.get("/", getSubcategories);
router.delete("/:id", deleteSubcategory);
router.get("/category/:categoryId", getSubcategoriesByCategoryId);

export default router;
