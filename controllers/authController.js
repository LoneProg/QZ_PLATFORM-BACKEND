const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const expiresIn = process.env.EXPIRES_IN;
    const payload = {
      user: {
        id: user.id,
        email: user.email,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn,
    });
    const userInfo = {
      id: user.id,
      email: user.email,

      access_token: token,
      status: "success",
      message: "User Logged in successful",
    };
    res.status(200).json({ userInfo });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { signup, login };
