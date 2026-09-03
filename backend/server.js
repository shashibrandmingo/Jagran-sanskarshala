import dotenv from "dotenv";

dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { seedAdminUser } from "./src/utils/seedAdmin.js";

const PORT = process.env.PORT || 5000;

/**
 * Clean up old MongoDB indexes on startup.
 * Drops any legacy mobile_1_type_1 unique index that causes conflicts.
 * Duplicate mobile check is now handled in surveyController.js via findOne().
 */
const cleanupOldIndexes = async () => {
  try {
    const { default: SurveySubmission } = await import("./src/models/SurveySubmission.js");
    const collection = SurveySubmission.collection;
    const indexes = await collection.indexes();
    const oldIndex = indexes.find((idx) => idx.name === "mobile_1_type_1");

    if (oldIndex) {
      console.log("🗑️  Dropping old unique index: mobile_1_type_1");
      await collection.dropIndex("mobile_1_type_1");
      console.log("✅ Old index dropped — duplicate check now handled in controller");
    }
  } catch (error) {
    // Silently ignore — index might not exist
  }
};

connectDB()
  .then(async () => {
    await seedAdminUser();
    await cleanupOldIndexes();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server Error :", error);
  });

