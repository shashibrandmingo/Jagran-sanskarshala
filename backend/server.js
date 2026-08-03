import dotenv from "dotenv";

dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { seedAdminUser } from "./src/utils/seedAdmin.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    await seedAdminUser();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server Error :", error);
  });
