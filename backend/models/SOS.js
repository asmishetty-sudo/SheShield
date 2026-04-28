const mongoose = require("mongoose");

const sosSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  isGuest: Boolean,

  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number],
  },
status: {
  type: String,
  enum: ["active", "accepted", "resolved", "escalated"],
  default: "active",
},

acceptedAt: {
  type: Date,
},
attemptLevel: {
  type: Number,
  default: 1, // 1 = nearby, 2 = expand, 3 = expand more
},
  acceptedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
});

module.exports = mongoose.model("SOS", sosSchema);