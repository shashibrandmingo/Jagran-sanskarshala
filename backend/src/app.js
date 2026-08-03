import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { API_VERSION } from "./constants.js";

const app = express();

/* ================================
   Security Middlewares
================================ */

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(null, true); // fallback for dev ease
    },
    credentials: true,
  }),
);

app.use(helmet());

app.use(compression());

app.use(cookieParser());

/* ================================
   Body Parser
================================ */

app.use(
  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

/* ================================
   Logger
================================ */

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ================================
   Health Check Route
================================ */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Jagran Sanskarshala Backend Running...",
  });
});

/* ================================
   API Health Route
================================ */

app.get(`${API_VERSION}/health`, (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working perfectly.",
  });
});

import adminRoutes from "./routes/adminRoutes.js";
import surveyRoutes from "./routes/surveyRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";

/* ================================
   API Routes
================================ */

app.use(`${API_VERSION}/admin`, adminRoutes);
app.use(`${API_VERSION}/survey`, surveyRoutes);
app.use(`${API_VERSION}/gallery`, galleryRoutes);

/* ================================
   404 Route
================================ */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* ================================
   Global Centralized Error Middleware
================================ */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
});

export default app;
