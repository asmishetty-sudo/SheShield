const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    userType: {
      type: String,
      enum: ["user", "volunteer_pending", "volunteer", "admin"],
      default: "user",
    },
    econtact: {
      type: String,
      // required: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
    },
    profilePic: {
      type: String,
    },
    lastSOS: Date,
    activeSOS: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SOS",
      default: null,
    },
    trusted: [
      {
        name: String,
        phone: String,
        email: String,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
  },
  { timestamps: true },
);
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
