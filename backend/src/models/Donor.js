import mongoose from "mongoose";

const badgeFromDonationCount = (count) => {
  if (count >= 20) return "Platinum";
  if (count >= 10) return "Gold";
  if (count >= 5) return "Silver";
  return "Bronze";
};

const donorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    availability: {
      type: String,
      required: true,
      enum: ["available", "away", "unavailable"],
      default: "available",
    },
    donationCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    badge: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Bronze",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically set badge based on donationCount
const updateBadge = function () {
  if (this.donationCount != null) {
    this.badge = badgeFromDonationCount(this.donationCount);
  }
};

donorSchema.pre("save", function () {
  updateBadge.call(this);
});

donorSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();
  if (update && update.donationCount != null) {
    update.badge = badgeFromDonationCount(update.donationCount);
    this.setUpdate(update);
  }
});

const Donor = mongoose.model("Donor", donorSchema);
export default Donor;
