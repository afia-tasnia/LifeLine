import Donor from "../models/Donor.js";

const createDonor = async (req, res) => {
  try {
    const {
      name,
      bloodGroup,
      location,
      phone,
      email,
      availability = "available",
      donationCount = 0,
      userId,
    } = req.body;

    if (!name || !bloodGroup || !location || !phone || !email) {
      return res.status(400).json({ message: "Please provide all required donor fields." });
    }

    const donor = await Donor.create({
      name,
      bloodGroup,
      location,
      phone,
      email,
      availability,
      donationCount,
      userId: userId || req.user._id,
    });

    return res.status(201).json(donor);
  } catch (error) {
    console.error("Error creating donor:", error);
    return res.status(500).json({ message: "Failed to create donor.", error: error.message });
  }
};

const getDonors = async (req, res) => {
  try {
    const { bloodGroup, location, search } = req.query;
    const filter = {};

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }
    if (location) {
      filter.location = { $regex: new RegExp(location, "i") };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ];
    }

    const donors = await Donor.find(filter).sort({ donationCount: -1, name: 1 });
    return res.status(200).json(donors);
  } catch (error) {
    console.error("Error fetching donors:", error.message);
    return res.status(500).json({ message: "Failed to load donors." });
  }
};

const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }
    return res.status(200).json(donor);
  } catch (error) {
    console.error("Error fetching donor by ID:", error.message);
    return res.status(500).json({ message: "Failed to load donor." });
  }
};

const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found." });
    }

    if (req.user.role !== "admin" && donor.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this donor." });
    }

    const updates = [
      "name",
      "bloodGroup",
      "location",
      "phone",
      "email",
      "availability",
      "donationCount",
    ];

    updates.forEach((field) => {
      if (req.body[field] !== undefined) {
        donor[field] = req.body[field];
      }
    });

    await donor.save();
    return res.status(200).json(donor);
  } catch (error) {
    console.error("Error updating donor:", error.message);
    return res.status(500).json({ message: "Failed to update donor." });
  }
};

export { createDonor, getDonors, getDonorById, updateDonor };
