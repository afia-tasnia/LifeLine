import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      default: null,
    },
    phone:     { type: String, default: null },
    location:  { type: String, default: null },
    role: {
      type: String,
      enum: ["donor", "receiver", "admin"],
      default: "donor",
    },
    availability: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
    donationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;