import { Router } from "express";
import {
  sendCertificateEmail,
  downloadCertificatePdf,
} from "../controllers/certificateController.js";

const router = Router();

router.post("/send", sendCertificateEmail);
router.get("/download", downloadCertificatePdf);

export default router;
