import { Router } from "express";
import {
  getAllStories,
  getStoryById,
  createOrUpdateStory,
  togglePublishStory,
  deleteStory,
} from "../controllers/storyController.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Public & Admin Routes
router.get("/all", getAllStories);
router.get("/:id", getStoryById);

// Admin Action Routes
router.post("/save", upload.single("image"), createOrUpdateStory);
router.patch("/:id/toggle-publish", togglePublishStory);
router.delete("/:id", deleteStory);

export default router;
