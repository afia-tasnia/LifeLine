import User        from "../models/User.js";
import bcrypt       from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getCompatibleDonorGroups } from "../utils/bloodCompatibility.js";

// ─── REGISTER USER ─────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone, location, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const user = await User.create({
      name, email,
      password: hashedPassword,
      bloodGroup: bloodGroup || null,
      phone:      phone      || null,
      location:   location   || null,
      role:       role       || "donor",
    });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      bloodGroup: user.bloodGroup, phone: user.phone,
      location: user.location, role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── LOGIN USER ────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email,
        bloodGroup: user.bloodGroup, phone: user.phone,
        location: user.location, role: user.role,
        availability: user.availability,
        donationCount: user.donationCount,
        lastDonatedAt: user.lastDonatedAt,
        avatarUrl: user.avatarUrl,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPDATE OWN PROFILE ────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "phone", "location", "bloodGroup", "availability"];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── UPLOAD AVATAR ─────────────────────────────────────────────────────────────
// multer puts the saved file info on req.file
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Build the public URL — served as /uploads/<filename> by app.js
    const avatarUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    ).select("-password");

    res.json({ avatarUrl: user.avatarUrl, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ALL DONORS (with optional blood-compatibility expansion) ───────────────
const getDonors = async (req, res) => {
  try {
    const { bloodGroup, location, search, compatible } = req.query;

    const filter = { role: "donor" };

    if (bloodGroup) {
      if (compatible === "true") {
        const groups = getCompatibleDonorGroups(bloodGroup);
        filter.bloodGroup = { $in: groups };
      } else {
        filter.bloodGroup = bloodGroup;
      }
    }

    if (location) filter.location = { $regex: new RegExp(location, "i") };
    if (search) {
      filter.$or = [
        { name:  { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ];
    }

    const donors = await User.find(filter).select("-password").sort({ name: 1 });
    return res.status(200).json(donors);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donors." });
  }
};

// ─── GET DONOR BY ID ───────────────────────────────────────────────────────────
const getDonorById = async (req, res) => {
  try {
    const donor = await User.findOne({ _id: req.params.id, role: "donor" }).select("-password");
    if (!donor) return res.status(404).json({ message: "Donor not found." });
    return res.status(200).json(donor);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donor." });
  }
};

export { registerUser, loginUser, updateProfile, uploadAvatar, getDonors, getDonorById };