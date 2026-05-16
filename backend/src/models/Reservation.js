import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null = walk-in / guest donor (not yet registered)
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },
    hospital: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "HH:MM"
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "fulfilled", "cancelled"],
      default: "pending",
    },
    urgency: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },
  },
  { timestamps: true }
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;