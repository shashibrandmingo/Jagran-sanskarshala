import express from "express";
import {
  getGalleryData,
  addGalleryYear,
  deleteGalleryYear,
  addGalleryCategory,
  updateGalleryCategory,
  deleteGalleryCategory,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
} from "../controllers/galleryController.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public Route
router.get("/", getGalleryData);

// Admin Category Routes
router.post("/categories", addGalleryCategory);
router.put("/categories/:id", updateGalleryCategory);
router.delete("/categories/:id", deleteGalleryCategory);

// Admin Year Edition Routes
router.post("/years", addGalleryYear);
router.delete("/years/:yearVal", deleteGalleryYear);

// Admin Photo Upload & Delete Routes (With Multer Middleware)
router.post("/photos", upload.array("photos", 50), uploadGalleryPhotos);
router.delete("/categories/:catId/photos/:photoId", deleteGalleryPhoto);

export default router;
