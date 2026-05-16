import BloodRequest from "../models/BloodRequest.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js";
import { syncDonorStats } from "./donationController.js";

// ─── helpers ───────────────────────────────────────────────────────────────────
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── CREATE blood request ──────────────────────────────────────────────────────
const createBloodRequest = async (req, res) => {
  try {
    const { bloodGroup, hospital, location, unitsNeeded, isEmergency } = req.body;

    if (!bloodGroup || !hospital || !location || !unitsNeeded) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // ── Emergency rate-limit: max 3 per user per day ───────────────────
    if (isEmergency) {
      const count = await BloodRequest.countDocuments({
        receiverId:  req.user._id,
        isEmergency: true,
        createdAt:   { $gte: startOfToday() },
      });

      if (count >= 3) {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        const resetInSeconds = Math.floor((midnight - Date.now()) / 1000);

        return res.status(429).json({
          message: "You have reached the limit of 3 emergency requests today.",
          emergencyRequestsUsed: 3,
          emergencyRequestsLimit: 3,
          resetInSeconds,
        });
      }

      req._emergencyCountAfter = count + 1;
    }

    const bloodRequest = await BloodRequest.create({
      receiverId: req.user._id,
      bloodGroup,
      hospital,
      location,
      unitsNeeded,
      isEmergency: isEmergency || false,
    });

    return res.status(201).json({
      ...bloodRequest.toObject(),
      ...(isEmergency && {
        emergencyRequestsUsed:  req._emergencyCountAfter,
        emergencyRequestsLimit: 3,
      }),
    });
  } catch (error) {
    console.error("Error creating blood request:", error);
    return res.status(500).json({ message: "Failed to create blood request.", error: error.message });
  }
};

// ─── GET today's emergency request count for the logged-in user ────────────────
const getEmergencyUsageToday = async (req, res) => {
  try {
    const count = await BloodRequest.countDocuments({
      receiverId:  req.user._id,
      isEmergency: true,
      createdAt:   { $gte: startOfToday() },
    });

    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const resetInSeconds = Math.floor((midnight - Date.now()) / 1000);

    return res.status(200).json({
      emergencyRequestsUsed:  count,
      emergencyRequestsLimit: 3,
      resetInSeconds,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch emergency usage." });
  }
};

// ─── GET all blood requests ────────────────────────────────────────────────────
const getBloodRequests = async (req, res) => {
  try {
    const { isEmergency, bloodGroup, status } = req.query;
    const filter = {};

    if (isEmergency !== undefined) filter.isEmergency = isEmergency === "true";
    if (bloodGroup)                filter.bloodGroup  = bloodGroup;
    if (status)                    filter.status      = status;

    const bloodRequests = await BloodRequest.find(filter)
      .populate("receiverId", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json(bloodRequests);
  } catch (error) {
    console.error("Error fetching blood requests:", error);
    return res.status(500).json({ message: "Failed to load blood requests." });
  }
};

// ─── GET emergency blood requests ─────────────────────────────────────────────
const getEmergencyRequests = async (req, res) => {
  try {
    const emergencyRequests = await BloodRequest.find({ isEmergency: true })
      .populate("receiverId", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json(emergencyRequests);
  } catch (error) {
    console.error("Error fetching emergency requests:", error);
    return res.status(500).json({ message: "Failed to load emergency requests." });
  }
};

// ─── GET blood request by ID ───────────────────────────────────────────────────
const getBloodRequestById = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id)
      .populate("receiverId", "name email phone location");

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    return res.status(200).json(bloodRequest);
  } catch (error) {
    console.error("Error fetching blood request:", error);
    return res.status(500).json({ message: "Failed to load blood request." });
  }
};

// ─── UPDATE blood request ──────────────────────────────────────────────────────
// When marking as "completed", the receiver can optionally pass donorPhone.
// If donorPhone is provided, we look up that donor and record a Donation so
// the donor's donation count and cooldown are updated automatically.
const updateBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    if (req.user.role !== "admin" && bloodRequest.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request." });
    }

    const { donorPhone, ...rest } = req.body;

    // Apply normal field updates
    const updates = ["bloodGroup", "hospital", "location", "unitsNeeded", "isEmergency", "status"];
    updates.forEach((field) => {
      if (rest[field] !== undefined) bloodRequest[field] = rest[field];
    });

    await bloodRequest.save();

    // ── If marking completed and donorPhone provided, record the donation ──
    if (rest.status === "completed" && donorPhone) {
      // Normalise phone: strip spaces/dashes so "01711 123456" matches "01711123456"
      const normPhone = donorPhone.replace(/[\s\-]/g, "");

      const donor = await User.findOne({
        role:  "donor",
        phone: { $regex: new RegExp(normPhone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) },
      });

      if (!donor) {
        // Request was still marked fulfilled — just warn about the phone
        return res.status(200).json({
          ...bloodRequest.toObject(),
          donorWarning: `No donor found with phone number "${donorPhone}". Request marked fulfilled but donation count was NOT updated. Double-check the number.`,
        });
      }

      // Create a donation record (units from the request)
      await Donation.create({
        donorId:    donor._id,
        receiverId: req.user._id,
        units:      bloodRequest.unitsNeeded,
      });

      // Sync donor stats (count + lastDonatedAt) from source of truth
      await syncDonorStats(donor._id);

      // Mark donor unavailable for 90 days
      await User.findByIdAndUpdate(donor._id, { availability: "unavailable" });

      return res.status(200).json({
        ...bloodRequest.toObject(),
        donorName: donor.name,
        donorId:   donor._id,
      });
    }

    return res.status(200).json(bloodRequest);
  } catch (error) {
    console.error("Error updating blood request:", error);
    return res.status(500).json({ message: "Failed to update blood request.", error: error.message });
  }
};

// ─── DELETE blood request ──────────────────────────────────────────────────────
const deleteBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    if (req.user.role !== "admin" && bloodRequest.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this request." });
    }

    await BloodRequest.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Blood request deleted." });
  } catch (error) {
    console.error("Error deleting blood request:", error);
    return res.status(500).json({ message: "Failed to delete blood request." });
  }
};

// ─── GET live stats (for Home.jsx) ────────────────────────────────────────────
const getLiveStats = async (req, res) => {
  try {
    const [totalDonors, totalRequests, emergencyRequests, fulfilledRequests] =
      await Promise.all([
        User.countDocuments({ role: "donor" }),
        BloodRequest.countDocuments(),
        BloodRequest.countDocuments({ isEmergency: true }),
        BloodRequest.countDocuments({ status: "completed" }),
      ]);

    return res.status(200).json({
      totalDonors,
      totalRequests,
      emergencyRequests,
      fulfilledRequests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load stats." });
  }
};

export {
  createBloodRequest,
  getEmergencyUsageToday,
  getBloodRequests,
  getEmergencyRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  getLiveStats,
};