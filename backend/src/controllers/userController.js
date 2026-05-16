import User         from "../models/User.js";
import bcrypt        from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getCompatibleDonorGroups } from "../utils/bloodCompatibility.js";
import Donation      from "../models/Donation.js";
import { syncDonorStats } from "./donationController.js";

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
      createdAt: user.createdAt,
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
      // Sync donation stats on login so the auth context gets fresh data
      if (user.role === "donor") {
        await syncDonorStats(user._id);
        const fresh = await User.findById(user._id).select("-password");
        return res.json({
          _id: fresh._id, name: fresh.name, email: fresh.email,
          bloodGroup: fresh.bloodGroup, phone: fresh.phone,
          location: fresh.location, role: fresh.role,
          availability:  fresh.availability,
          donationCount: fresh.donationCount,
          lastDonatedAt: fresh.lastDonatedAt,
          avatarUrl:     fresh.avatarUrl,
          createdAt:     fresh.createdAt,
          token: generateToken(fresh),
        });
      }

      return res.json({
        _id: user._id, name: user.name, email: user.email,
        bloodGroup: user.bloodGroup, phone: user.phone,
        location: user.location, role: user.role,
        availability:  user.availability,
        donationCount: user.donationCount,
        lastDonatedAt: user.lastDonatedAt,
        avatarUrl:     user.avatarUrl,
        createdAt:     user.createdAt,
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
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl }, { new: true }).select("-password");
    res.json({ avatarUrl: user.avatarUrl, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET ALL DONORS ────────────────────────────────────────────────────────────
// FIX: Enriches each donor with a live donationCount from the donations
// collection, so the Donor Directory page always shows the correct badge/count.
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

    // Pull real donation counts for all donors in a single aggregation
    const donorIds = donors.map(d => d._id);
    const stats = await Donation.aggregate([
      { $match: { donorId: { $in: donorIds } } },
      {
        $group: {
          _id: "$donorId",
          donationCount: { $sum: 1 },
          lastDonatedAt: { $max: "$createdAt" },
        },
      },
    ]);

    const statsMap = {};
    stats.forEach(s => { statsMap[s._id.toString()] = s; });

    const enriched = donors.map(d => ({
      ...d.toObject(),
      donationCount: statsMap[d._id.toString()]?.donationCount ?? 0,
      lastDonatedAt: statsMap[d._id.toString()]?.lastDonatedAt ?? null,
    }));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donors." });
  }
};

// ─── GET DONOR BY ID ───────────────────────────────────────────────────────────
// FIX: Always computes donationCount from donations collection and syncs back.
const getDonorById = async (req, res) => {
  try {
    const donor = await User.findOne({ _id: req.params.id, role: "donor" }).select("-password");
    if (!donor) return res.status(404).json({ message: "Donor not found." });

    const { donationCount, lastDonatedAt } = await syncDonorStats(donor._id);

    return res.status(200).json({
      ...donor.toObject(),
      donationCount,
      lastDonatedAt,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donor." });
  }
};

export { registerUser, loginUser, updateProfile, uploadAvatar, getDonors, getDonorById };