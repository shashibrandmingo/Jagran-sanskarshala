import { Router } from "express";
import {
  submitContactForm,
  getAllContactLeads,
  exportContactLeadsCSV,
  deleteContactLead,
} from "../controllers/contactController.js";

const router = Router();

// Public submission route
router.post("/submit", submitContactForm);

// Admin operations routes
router.get("/export", exportContactLeadsCSV);
router.get("/all", getAllContactLeads);
router.delete("/:id", deleteContactLead);

export default router;
