import Admin from "../models/Admin.js";

const ADMIN_SEED_CREDENTIALS = {
  email: "jagransanskarshala2026@gmail.com",
  password: "26@Jagran#BM",
  name: "Jagran Sanskarshala Admin",
  role: "superadmin",
};

export const seedAdminUser = async () => {
  try {
    const adminExists = await Admin.findOne({
      email: ADMIN_SEED_CREDENTIALS.email,
    });

    if (!adminExists) {
      await Admin.create(ADMIN_SEED_CREDENTIALS);
      console.log(
        `✅ Default Admin Seeded Successfully: ${ADMIN_SEED_CREDENTIALS.email}`
      );
    } else {
      console.log(
        `ℹ️ Admin Account Exists: ${ADMIN_SEED_CREDENTIALS.email}`
      );
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
  }
};