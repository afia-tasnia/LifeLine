import Donation from "../models/Donation.js";
import User     from "../models/User.js";

const COOLDOWN_DAYS = 90;

// ─── CREATE donation record ────────────────────────────────────────────────────
const createDonation = async (req, res) => {
  try {
    const { receiverId, units } = req.body;

    if (!receiverId || !units) {
      return res.status(400).json({ message: "Please provide receiverId and units." });
    }

    // ── Cooldown check ────────────────────────────────────────────────
    const donor = await User.findById(req.user._id);

    if (donor.lastDonatedAt) {
      const daysSince = Math.floor(
        (Date.now() - new Date(donor.lastDonatedAt)) / (1000 * 60 * 60 * 24)
      );
      const daysRemaining = COOLDOWN_DAYS - daysSince;

      if (daysRemaining > 0) {
        return res.status(429).json({
          message: `You are in your donation cooldown period. You can donate again in ${daysRemaining} day(s).`,
          daysRemaining,
          lastDonatedAt: donor.lastDonatedAt,
        });
      }
    }

    // ── Record the donation ───────────────────────────────────────────
    const donation = await Donation.create({
      donorId:    req.user._id,
      receiverId,
      units,
    });

    // ── Update donor fields atomically ────────────────────────────────
    await User.findByIdAndUpdate(req.user._id, {
      $inc:  { donationCount: 1 },
      $set:  {
        lastDonatedAt: new Date(),
        availability:  "unavailable",   // automatically mark unavailable
      },
    });

    return res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    return res.status(500).json({ message: "Failed to record donation.", error: error.message });
  }
};

// ─── GET cooldown status for the logged-in donor ──────────────────────────────
const getCooldownStatus = async (req, res) => {
  try {
    const donor = await User.findById(req.user._id).select("lastDonatedAt availability");

    if (!donor.lastDonatedAt) {
      return res.status(200).json({ inCooldown: false, daysRemaining: 0, lastDonatedAt: null });
    }

    const daysSince = Math.floor(
      (Date.now() - new Date(donor.lastDonatedAt)) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, COOLDOWN_DAYS - daysSince);

    // Auto-restore availability when cooldown has ended
    if (daysRemaining === 0 && donor.availability === "unavailable") {
      await User.findByIdAndUpdate(req.user._id, { availability: "available" });
    }

    return res.status(200).json({
      inCooldown:    daysRemaining > 0,
      daysRemaining,
      lastDonatedAt: donor.lastDonatedAt,
      cooldownDays:  COOLDOWN_DAYS,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cooldown status." });
  }
};

// ─── GET all donations (admin only) ───────────────────────────────────────────
const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donorId",    "name email phone bloodGroup")
      .populate("receiverId", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donations." });
  }
};

// ─── GET donor's own donation history (private) ────────────────────────────────
const getDonorHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate("receiverId", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donation history." });
  }
};

// ─── GET donations by donor ID — PUBLIC (for donor profile page) ───────────────
// Anyone can view a donor's donation list; sensitive receiver fields are excluded.
const getDonationsByDonorId = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.params.donorId })
      .populate("receiverId", "name location") // no email/phone for privacy
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load donations." });
  }
};

// ─── DELETE a donation (owner only) ───────────────────────────────────────────
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found." });
    }

    if (donation.donorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorised to delete this donation." });
    }

    await Donation.findByIdAndDelete(req.params.id);

    // Decrement donationCount on the user (floor at 0)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { donationCount: -1 },
    });

    return res.status(200).json({ message: "Donation deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete donation." });
  }
};

// ─── GET receiver's received donations ────────────────────────────────────────
const getReceiverDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ receiverId: req.user._id })
      .populate("donorId", "name email phone bloodGroup")
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load received donations." });
  }
};

// ─── GET top donors ───────────────────────────────────────────────────────────
const getTopDonors = async (req, res) => {
  try {
    const topDonors = await Donation.aggregate([
      { $group: { _id: "$donorId", totalDonations: { $sum: "$units" }, donationCount: { $sum: 1 } } },
      { $sort: { totalDonations: -1 } },
      { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "donor" } },
      { $unwind: "$donor" },
      {
        $project: {
          _id: 0,
          donorId: "$_id",
          donor: { _id: "$donor._id", name: "$donor.name", email: "$donor.email", bloodGroup: "$donor.bloodGroup" },
          totalDonations: 1,
          donationCount:  1,
        },
      },
    ]);

    return res.status(200).json(topDonors);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load top donors." });
  }
};

export {
  createDonation,
  getCooldownStatus,
  getDonations,
  getDonorHistory,
  getDonationsByDonorId,
  deleteDonation,
  getReceiverDonations,
  getTopDonors,
};