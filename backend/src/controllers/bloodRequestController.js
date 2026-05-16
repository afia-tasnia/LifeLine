import BloodRequest from "../models/BloodRequest.js";

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
        // Calculate seconds until midnight so the frontend can show a countdown
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

      // Attach current count to the response body so the frontend can update the UI
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
      // Only included when isEmergency so the frontend can refresh the counter
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
// Used by the frontend to show "X/3 emergency requests used today" on page load
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
const updateBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    if (req.user.role !== "admin" && bloodRequest.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request." });
    }

    const updates = ["bloodGroup", "hospital", "location", "unitsNeeded", "isEmergency", "status"];
    updates.forEach((field) => {
      if (req.body[field] !== undefined) bloodRequest[field] = req.body[field];
    });

    await bloodRequest.save();
    return res.status(200).json(bloodRequest);
  } catch (error) {
    console.error("Error updating blood request:", error);
    return res.status(500).json({ message: "Failed to update blood request." });
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
// Replaces the hardcoded mock data currently on the Home page
import User from "../models/User.js";

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