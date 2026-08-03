import express from "express";
import { submitSurvey, getAllSurveys, getSurveyStats } from "../controllers/surveyController.js";
import { protectAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public Route: Submit Survey Response
router.post("/submit", submitSurvey);

// Protected Admin Routes: Fetch Submissions & Stats
router.get("/all", protectAdmin, getAllSurveys);
router.get("/stats", protectAdmin, getSurveyStats);

export default router;
