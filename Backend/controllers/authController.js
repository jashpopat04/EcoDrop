const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      companyName,
      authorizedPerson,
      contactNumber,
      gstNumber
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      companyName: role === "recycler" ? companyName : undefined,
      authorizedPerson: role === "recycler" ? authorizedPerson : undefined,
      contactNumber,
      gstNumber: role === "recycler" ? gstNumber : undefined
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  console.log("--- NEW LOGIN ATTEMPT ---");
  console.log("Incoming data:", req.body);

  try {
    if (!req.body.email || !req.body.password) {
       console.log("Error: Missing email or password");
       return res.status(400).json({ message: "Missing email or password" });
    }

    // Force strict string, lowercase, and trim to destroy any invisible spaces
    const searchEmail = String(req.body.email).toLowerCase().trim();
    console.log("Searching DB for EXACTLY:", `"${searchEmail}"`);

    const user = await User.findOne({ email: searchEmail });
    console.log("Database result:", user ? "User Found!" : "NULL (User Not Found)");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      console.log("Error: Password mismatch!");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Login successful! Generating token...");
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message });
  }
};