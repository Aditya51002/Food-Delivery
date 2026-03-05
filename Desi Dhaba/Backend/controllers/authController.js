const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─── Register ────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
      phone: phone || "",
      role: role === "admin" && process.env.ALLOW_ADMIN_REGISTER === "true" ? "admin" : "user",
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      savedAddresses: user.savedAddresses,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated. Contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      savedAddresses: user.savedAddresses,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Get Profile ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (req.file) user.avatar = req.file.path;

    await user.save();
    const updated = await User.findById(user._id).select("-password");
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Change Password ─────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Saved Addresses ─────────────────────────────────────────────────────────
const addAddress = async (req, res) => {
  try {
    const { label, address, isDefault } = req.body;
    if (!address) return res.status(400).json({ message: "Address is required" });

    const user = await User.findById(req.user._id);
    if (isDefault) {
      user.savedAddresses.forEach((a) => (a.isDefault = false));
    }
    user.savedAddresses.push({ label: label || "Home", address, isDefault: !!isDefault });
    await user.save();
    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedAddresses = user.savedAddresses.filter(
      (a) => a._id.toString() !== req.params.addressId
    );
    await user.save();
    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── Admin: Get All Users ─────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const total = await User.countDocuments({ role: "user" });
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword, addAddress, deleteAddress, getAllUsers };
