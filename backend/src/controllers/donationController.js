import Donation from "../models/Donation.js";


// CREATE donation record
const createDonation = async (req, res) => {
  try {
    const { receiverId, units } = req.body;

    if (!receiverId || !units) {
      return res.status(400).json({ message: "Please provide receiverId and units." });
    }

    const donation = await Donation.create({
      donorId: req.user._id,
      receiverId,
      units,
    });

    return res.status(201).json(donation);
  } catch (error) {
    console.error("Error creating donation:", error);
    return res.status(500).json({ message: "Failed to record donation.", error: error.message });
  }
};

// GET all donations
const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donorId", "name email phone bloodGroup")
      .populate("receiverId", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    return res.status(500).json({ message: "Failed to load donations." });
  }
};

// GET donor's donation history
const getDonorHistory = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user._id })
      .populate("receiverId", "name email phone location")
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching donor history:", error);
    return res.status(500).json({ message: "Failed to load donation history." });
  }
};

// GET receiver's received donations
const getReceiverDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ receiverId: req.user._id })
      .populate("donorId", "name email phone bloodGroup")
      .sort({ createdAt: -1 });

    return res.status(200).json(donations);
  } catch (error) {
    console.error("Error fetching receiver donations:", error);
    return res.status(500).json({ message: "Failed to load received donations." });
  }
};

// GET top donors (by donation count)
const getTopDonors = async (req, res) => {
  try {
    const topDonors = await Donation.aggregate([
      {
        $group: {
          _id: "$donorId",
          totalDonations: { $sum: "$units" },
          donationCount: { $sum: 1 },
        },
      },
      { $sort: { totalDonations: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "donor",
        },
      },
      { $unwind: "$donor" },
      {
        $project: {
          _id: 0,
          donorId: "$_id",
          donor: {
            _id: "$donor._id",
            name: "$donor.name",
            email: "$donor.email",
            bloodGroup: "$donor.bloodGroup",
          },
          totalDonations: 1,
          donationCount: 1,
        },
      },
    ]);

    return res.status(200).json(topDonors);
  } catch (error) {
    console.error("Error fetching top donors:", error);
    return res.status(500).json({ message: "Failed to load top donors." });
  }
};

export {
  createDonation,
  getDonations,
  getDonorHistory,
  getReceiverDonations,
  getTopDonors,
};
