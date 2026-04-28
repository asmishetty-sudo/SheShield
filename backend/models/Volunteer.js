const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: String,
    phone: String,
    age: Number,
    gender: String,
    address: String,
    skills: String,

    idType: String,
    idNumber: String,

    document: String, // file URL (Cloudinary)

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isVerifiedVolunteer: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);