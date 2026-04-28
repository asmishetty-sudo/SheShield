const User = require("../models/User");
const Volunteer = require("../models/Volunteer");

// Suspend / Unsuspend
exports.toggleSuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // prevent admin suspension
    if (user.userType === "admin") {
      return res.status(403).json({ message: "Cannot suspend admin" });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      success: true,
      message: user.isSuspended ? "User suspended" : "User activated",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType === "admin") {
      return res.status(403).json({ message: "Cannot delete admin" });
    }
   await Volunteer.deleteOne({ userId: user._id }); // Clean up volunteer data if exists
    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.approveVolunteer = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    // Update volunteer
    volunteer.status = "approved";
    volunteer.isVerifiedVolunteer = true;
    await volunteer.save();

    // Update user
    if (volunteer.userId) {
      await User.findByIdAndUpdate(volunteer.userId, {
        userType: "volunteer",
      });
    }

    return res.json({
      success: true,
      message: "Volunteer approved successfully",
    });
  } catch (err) {
    console.log("Approve error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// REJECT VOLUNTEER
exports.rejectVolunteer = async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    // Only status changes
    volunteer.status = "rejected";
    volunteer.isVerifiedVolunteer = false;
    await volunteer.save();

    return res.json({
      success: true,
      message: "Volunteer rejected",
    });
  } catch (err) {
    console.log("Reject error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};