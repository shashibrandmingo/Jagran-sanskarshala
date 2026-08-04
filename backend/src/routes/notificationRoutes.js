import express from "express";
import {
  createNotification,
  getAllNotifications,
  getPublishedNotifications,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Route - Frontend ticker bar
router.get("/published", getPublishedNotifications);

// Admin Routes (Protected)
router.get("/", protectAdmin, getAllNotifications);
router.post("/", protectAdmin, createNotification);
router.put("/:id", protectAdmin, updateNotification);
router.delete("/:id", protectAdmin, deleteNotification);

export default router;
