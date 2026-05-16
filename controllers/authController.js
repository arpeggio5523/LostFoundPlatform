import bcrypt from "bcrypt";
import User from "../models/User.js";

// Register a new user into the system
export const signup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, occupation, password} = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const newUser = new User({
      fullName,
      email,
      password,
      ...(phoneNumber && { phoneNumber }),
      ...(occupation && { occupation }),
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Authenticate existing user credentials and log in
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare provided password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      message: "Login successful",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};