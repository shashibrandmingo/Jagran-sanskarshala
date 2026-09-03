
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
      { autoIndex: false },
    );

    console.log(
      `✅ MongoDB Connected : ${connectionInstance.connection.host}/${DB_NAME}`,
    );

    // console.log(connectionInstance);
  } catch (error) {
    console.error("❌ MongoDB Connection Error :", error.message);

    process.exit(1);
  }
};

export default connectDB;
