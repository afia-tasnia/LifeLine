import Reservation from "../models/Reservation.js";
import Donation    from "../models/Donation.js";
import User        from "../models/User.js";
import { syncDonorStats } from "./donationController.js";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── CREATE reservation (public — donor submits the form) ──────────────────────
const createReservation = async (req, res) => {
  try {
    const { name, phone, bloodGroup, hospital, date, time, note } = req.body;

    if (!name || !phone || !bloodGroup || !hospital || !date || !time) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const reservation = await Reservation.create({
      donorId: req.user?._id ?? null,
      name,
      phone,
      bloodGroup,
      hospital,
      date,
      time,
      note: note || "",
    });

    return res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    return res.status(500).json({ message: "Failed to create reservation.", error: error.message });
  }
};

// ─── GET all reservations (admin only) ────────────────────────────────────────
const getReservations = async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date)   filter.date   = date;

    const reservations = await Reservation.find(filter)
      .populate("donorId", "name email phone bloodGroup")
      .sort({ date: 1, time: 1 });

    return res.status(200).json(reservations);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reservations." });
  }
};

// ─── GET today's reservation count (for admin header stat) ────────────────────
const getTodayStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    const [todayTotal, pending, confirmed, fulfilled] = await Promise.all([
      Reservation.countDocuments({ date: todayStr }),
      Reservation.countDocuments({ status: "pending" }),
      Reservation.countDocuments({ status: "confirmed" }),
      Reservation.countDocuments({ date: todayStr, status: "fulfilled" }),
    ]);

    return res.status(200).json({ todayTotal, pending, confirmed, fulfilled });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load stats." });
  }
};

// ─── UPDATE reservation status (admin only) ───────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { status, urgency } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });

    const wasAlreadyFulfilled = reservation.status === "fulfilled";

    if (status)  reservation.status  = status;
    if (urgency) reservation.urgency = urgency;
    await reservation.save();

    // ── Auto-create a Donation record when marked fulfilled ────────────────
    // Only fires once (guards against double-marking) and only when the
    // reservation is linked to a registered donor (donorId is not null).
    if (status === "fulfilled" && !wasAlreadyFulfilled && reservation.donorId) {
      try {
        const latestRequest = await (await import("../models/BloodRequest.js")).default
          .findOne({ status: "pending" })
          .sort({ createdAt: -1 })
          .select("_id receiverId");

        const receiverId = latestRequest?.receiverId ?? reservation.donorId;

        await Donation.create({
          donorId:    reservation.donorId,
          receiverId: receiverId,
          units:      1,
        });

        // FIX: Use syncDonorStats instead of $inc so count never drifts
        await syncDonorStats(reservation.donorId);

        // Always mark unavailable after donation
        await User.findByIdAndUpdate(reservation.donorId, { availability: "unavailable" });

      } catch (donationErr) {
        console.error("Failed to auto-create donation record:", donationErr.message);
      }
    }

    return res.status(200).json(reservation);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update reservation." });
  }
};

// ─── DELETE reservation (admin only) ──────────────────────────────────────────
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found." });
    return res.status(200).json({ message: "Reservation removed." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete reservation." });
  }
};

export {
  createReservation,
  getReservations,
  getTodayStats,
  updateReservationStatus,
  deleteReservation,
};