import mongoose from "mongoose";
import dotenv from "dotenv";
import { signAccessToken } from "./utils/authSession.js";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const user = await User.findOne();
    if (!user) {
      console.log("No user found");
      process.exit(1);
    }
    const token = signAccessToken(user, new mongoose.Types.ObjectId());
    
    const res = await fetch("http://localhost:3000/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Test item",
        description: "Test description 123",
        category: "Electronics",
        location: "Test Location",
        date: new Date().toISOString(),
        images: [],
        type: "Found",
        user: "Anonymous"
      })
    });
    
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
