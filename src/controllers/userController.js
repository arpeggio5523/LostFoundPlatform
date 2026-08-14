import User from "../models/User.js";

// Logic for creating a user
export const createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (password !== user.password) { 
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Logic for getting all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const updatePrivacyMode = async (req, res) => {
    try {
    const { privacyMode } = req.body;

    if (typeof privacyMode !== "boolean") {
      return res.status(400).json({
        message: "privacyMode must be a boolean",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { privacyMode },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Privacy setting updated",
      privacyMode: user.privacyMode,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};