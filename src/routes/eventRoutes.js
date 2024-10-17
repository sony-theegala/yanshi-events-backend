import { Router } from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByCategoryAndSubcategory,
} from "../controllers/eventController.js";

const router = Router();

router.get("/filter", getEventsByCategoryAndSubcategory);
router.post("/", createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
