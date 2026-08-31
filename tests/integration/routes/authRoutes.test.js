import request from "supertest";
import mongoose from "mongoose";

import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
} from "vitest";

import { app } from "../../../src/server.js";
import User from "../../../src/models/User.js";


vi.mock("../../../src/utils/emailService.js", () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue(true),
}));


beforeAll(async () => {
  if (!process.env.MONGO_URI_TEST) {
    throw new Error("MONGO_URI_TEST is not defined");
  }

  if (!process.env.MONGO_URI_TEST.includes("lostfound_test")) {
    throw new Error(
      "Refusing to run integration tests on a non-test database"
    );
  }

  console.log("Connecting to test database...");

  await mongoose.connect(process.env.MONGO_URI_TEST, {
    serverSelectionTimeoutMS: 20000,
  });

  console.log("Connected to test database");
}, 30000);

afterAll(async () => {
  await User.deleteMany({
    email: {
      $in: [
        "testuser@example.com",
        "duplicate@example.com",
        "loginuser@example.com",
        "unverified@example.com",
        "verifieduser@example.com",
      ],
    },
  });

  await mongoose.connection.close();
});


describe("Auth Routes", () => {

  beforeEach(async () => {
    vi.clearAllMocks();

    await User.deleteMany({
      email: {
        $in: [
          "testuser@example.com",
          "duplicate@example.com",
          "loginuser@example.com",
          "unverified@example.com",
          "verifieduser@example.com",
        ],
      },
    });
  });


  describe("POST /api/auth/signup", () => {

    it("creates a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Test User",
          email: "testuser@example.com",
          phoneNumber: "0123456789",
          occupation: "Student",
          password: "Password123!",
        });

      expect(response.status).toBe(201);

      expect(response.body.message).toBe(
        "Registration successful. Please check your email to verify your account."
      );
    });


    it("stores the new user in the database", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Test User",
          email: "testuser@example.com",
          password: "Password123!",
        });

      const user = await User.findOne({
        email: "testuser@example.com",
      });

      expect(user).not.toBeNull();

      expect(user.fullName).toBe("Test User");

      expect(user.email).toBe(
        "testuser@example.com"
      );
    });


    it("rejects duplicate email", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "First User",
          email: "duplicate@example.com",
          password: "Password123!",
        });

      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Second User",
          email: "duplicate@example.com",
          password: "Password123!",
        });

      expect(response.status).toBe(400);

      expect(response.body.message).toBe(
        "Email already exists"
      );
    });

  });


  describe("POST /api/auth/login", () => {

    it("rejects login when email does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "doesnotexist@example.com",
          password: "Password123!",
        });

      expect(response.status).toBe(400);

      expect(response.body.message).toBe(
        "Invalid email or password"
      );
    });


    it("rejects login when password is incorrect", async () => {

      await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Login User",
          email: "loginuser@example.com",
          password: "Password123!",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "loginuser@example.com",
          password: "WrongPassword123!",
        });

      expect(response.status).toBe(400);

      expect(response.body.message).toBe(
        "Invalid email or password"
      );
    });


    it("rejects login when email is not verified", async () => {

      await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Unverified User",
          email: "unverified@example.com",
          password: "Password123!",
        });

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unverified@example.com",
          password: "Password123!",
        });

      expect(response.status).toBe(403);

      expect(response.body.message).toBe(
        "Please verify your email before logging in."
      );
    });

    it("logs in successfully with correct credentials and verified email", async () => {

      await request(app)
        .post("/api/auth/signup")
        .send({
          fullName: "Verified User",
          email: "verifieduser@example.com",
          password: "Password123!",
        });

      const user = await User.findOne({
        email: "verifieduser@example.com",
      });

      user.isEmailVerified = true;
      await user.save();

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "verifieduser@example.com",
          password: "Password123!",
        });

      expect(response.status).toBe(200);

      expect(response.body.message).toBe(
        "Login successful"
      );
    });
  });
  
  describe("POST /api/auth/logout", () => {

    it("logs out successfully", async () => {
      const response = await request(app)
        .post("/api/auth/logout");

      expect(response.status).toBe(200);

      expect(response.body.message).toBe(
        "Logged out successfully."
      );
    });

  });

});