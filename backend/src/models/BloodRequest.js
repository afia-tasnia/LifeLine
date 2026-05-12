import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },
    hospital: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

export default BloodRequest;
