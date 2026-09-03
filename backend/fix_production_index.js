/**
 * One-time script to fix MongoDB production index.
 * Drops old strict unique index and creates new partial unique index.
 * 
 * Usage: node fix_production_index.js
 */
import dotenv from "dotenv";
dotenv.config();

import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from "mongoose";
import { DB_NAME } from "./src/constants.js";

const run = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.db.collection("surveysubmissions");

    // List all current indexes
    const indexes = await collection.indexes();
    console.log("\n📋 Current Indexes:");
    indexes.forEach((idx, i) => {
      console.log(`  ${i + 1}. Name: "${idx.name}", Keys: ${JSON.stringify(idx.key)}, Unique: ${idx.unique || false}, Partial: ${idx.partialFilterExpression ? JSON.stringify(idx.partialFilterExpression) : 'NONE'}`);
    });

    // Drop the old index if it exists
    const oldIndex = indexes.find((idx) => idx.name === "mobile_1_type_1");
    if (oldIndex) {
      console.log(`\n🗑️  Dropping old index: "${oldIndex.name}"...`);
      await collection.dropIndex("mobile_1_type_1");
      console.log("✅ Old index dropped!");
    }

    // Create the new correct partial index using $gte: "0"
    // "-" (ASCII 45) and "" are both < "0" (ASCII 48), so they get excluded
    console.log("\n🔄 Creating new partial unique index (mobile >= '0')...");
    await collection.createIndex(
      { mobile: 1, type: 1 },
      {
        unique: true,
        partialFilterExpression: { mobile: { $gte: "0" } }
      }
    );
    console.log("✅ New partial unique index created successfully!");

    // Verify
    const newIndexes = await collection.indexes();
    console.log("\n📋 Updated Indexes:");
    newIndexes.forEach((idx, i) => {
      console.log(`  ${i + 1}. Name: "${idx.name}", Keys: ${JSON.stringify(idx.key)}, Unique: ${idx.unique || false}, Partial: ${idx.partialFilterExpression ? JSON.stringify(idx.partialFilterExpression) : 'NONE'}`);
    });

    console.log("\n🎉 Production database fix complete! Deploy your backend now.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
