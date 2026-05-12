import BloodRequest from "../models/BloodRequest.js";

// CREATE blood request
const createBloodRequest = async (req, res) => {
  try {
    const { bloodGroup, hospital, location, unitsNeeded, isEmergency } = req.body;

    if (!bloodGroup || !hospital || !location || !unitsNeeded) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const bloodRequest = await BloodRequest.create({
      receiverId: req.user._id,
      bloodGroup,
      hospital,
      location,
      unitsNeeded,
      isEmergency: isEmergency || false,
    });

    return res.status(201).json(bloodRequest);
  } catch (error) {
    console.error("Error creating blood request:", error);
    return res.status(500).json({ message: "Failed to create blood request.", error: error.message });
  }
};

// GET all blood requests
const getBloodRequests = async (req, res) => {
  try {
    const { isEmergency, bloodGroup, status } = req.query;
    const filter = {};

    if (isEmergency !== undefined) {
      filter.isEmergency = isEmergency === "true";
    }
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }
    if (status) {
      filter.status = status;
    }

    const bloodRequests = await BloodRequest.find(filter)
      .populate("receiverId", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json(bloodRequests);
  } catch (error) {
    console.error("Error fetching blood requests:", error);
    return res.status(500).json({ message: "Failed to load blood requests." });
  }
};

// GET emergency blood requests
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

// GET blood request by ID
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

// UPDATE blood request
const updateBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    // Only receiver or admin can update
    if (req.user.role !== "admin" && bloodRequest.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request." });
    }

    const updates = ["bloodGroup", "hospital", "location", "unitsNeeded", "isEmergency", "status"];

    updates.forEach((field) => {
      if (req.body[field] !== undefined) {
        bloodRequest[field] = req.body[field];
      }
    });

    await bloodRequest.save();
    return res.status(200).json(bloodRequest);
  } catch (error) {
    console.error("Error updating blood request:", error);
    return res.status(500).json({ message: "Failed to update blood request." });
  }
};

// DELETE blood request
const deleteBloodRequest = async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);

    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    // Only receiver or admin can delete
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

export {
  createBloodRequest,
  getBloodRequests,
  getEmergencyRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
};
