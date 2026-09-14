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
const setupIndexes = async () => {
  try {
    const { default: SurveySubmission } = await import("./src/models/SurveySubmission.js");
    const collection = SurveySubmission.collection;
    const indexes = await collection.indexes();
    const oldIndex = indexes.find((idx) => idx.name === "mobile_1_type_1" && idx.unique);

    if (oldIndex) {
      console.log("🗑️  Dropping old unique index: mobile_1_type_1");
      await collection.dropIndex("mobile_1_type_1");
      console.log("✅ Old unique index dropped.");
    }

    // Build compound performance indexes across all models (non-blocking in background)
    console.log("⚡ Ensuring database performance indexes...");
    const { Story } = await import("./src/models/Story.js");
    const { GalleryCategory, GalleryYear } = await import("./src/models/Gallery.js");
    const { Notification } = await import("./src/models/Notification.js");

    await Promise.allSettled([
      SurveySubmission.createIndexes(),
      Story.createIndexes(),
      GalleryCategory.createIndexes(),
      GalleryYear.createIndexes(),
      Notification.createIndexes(),
    ]);
    console.log("✅ Database indexes verified & active.");
  } catch (error) {
    console.error("⚠️ Index setup notice:", error.message);
  }
};

connectDB()
  .then(async () => {
    await seedAdminUser();
    await setupIndexes();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server Error :", error);
  });

