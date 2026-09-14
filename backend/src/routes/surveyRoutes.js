import express from "express";
import {
  submitSurvey,
  getAllSurveys,
  getSurveyStats,
  getSurveyDetails,
  exportSurveysCsv,
} from "../controllers/surveyController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Route: Submit Survey Response
router.post("/submit", submitSurvey);

// Protected Admin Routes: Fetch Submissions, Stats, Detail & Export
router.get("/all", protectAdmin, getAllSurveys);
router.get("/stats", protectAdmin, getSurveyStats);
router.get("/detail/:id", protectAdmin, getSurveyDetails);
router.get("/export", protectAdmin, exportSurveysCsv);

export default router;
