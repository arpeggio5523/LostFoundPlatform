import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const requiredVariables = ["MONGO_URI", "ADMIN_FULL_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

if (missingVariables.length > 0) {
  console.error(`Missing required environment variables: ${missingVariables.join(", ")}`);
  process.exitCode = 1;
} else {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        `An account already exists for ${email}. Refusing to change its role automatically.`
      );
    }

    const admin = await User.create({
      fullName: process.env.ADMIN_FULL_NAME.trim(),
      email,
      password: process.env.ADMIN_PASSWORD,
      role: "Admin",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });

    console.log(`Admin account created successfully: ${admin.email}`);
  } catch (error) {
    const message =
      error.name === "ValidationError"
        ? Object.values(error.errors).map((entry) => entry.message).join("; ")
        : error.message;

    console.error(`Could not create admin account: ${message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
