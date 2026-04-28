const User = require("../models/User");
const SOS = require("../models/SOS");
const Volunteer = require("../models/Volunteer");

exports.getUserInfo = async (req, res) => {
  try {
    const userId = req.user.userId; //correct from middleware

    // USER
    const user = await User.findById(userId).select("-password");

    if (!user) { 
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const getResolvedWithin = (createdAt, resolvedAt) => {
      if (!resolvedAt) return "Not resolved";

      const diffMs = new Date(resolvedAt) - new Date(createdAt);

      const sec = Math.floor(diffMs / 1000);
      const min = Math.floor(sec / 60);
      const hr = Math.floor(min / 60);
      const day = Math.floor(hr / 24);

      if (sec < 60) return `${sec} sec`;
      if (min < 60) return `${min} min`;
      if (hr < 24) return `${hr} hrs`;
      return `${day} days`;
    };
    //TRUSTED CONTACTS
    const trustedContacts = user.trusted || [];

    //ACTIVE SOS (using user.activeSOS instead of random query)
    let activeSOSData = null;

    if (user.activeSOS) {
      const activeSOS = await SOS.findById(user.activeSOS)
        .populate("acceptedBy", "name profilePic econtact location")
        .populate("userId", "_id name profilePic econtact location");

      if (activeSOS) {
        const isSender = activeSOS.userId._id.toString() === userId.toString();

        activeSOSData = {
          role: isSender ? "sender" : "volunteer",
          location: activeSOS.location,
          status: activeSOS.status,
          ...(isSender
            ? { volunteers: activeSOS.acceptedBy || [] }
            : { victim: activeSOS.userId }),
        };
      }
    }
    // SOS HISTORY (user created)
    const sentSOS = await SOS.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("acceptedBy", "name profilePic");
    //ACCEPTED SOS (if volunteer)
    let acceptedSOS = [];
let volunteerData = null;

if (user.userType !== "user") {
  volunteerData = await Volunteer.findOne({ userId }).select(
    "-idNumber" 
  );
}
    if (user.userType === "volunteer") {
      acceptedSOS = await SOS.find({
        acceptedBy: userId, //because it's array
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate("userId", "name profilePic");
    }
    //  FORMAT SENT SOS (user is sender)
    const formattedSent = sentSOS.map((sos) => ({
      sentAt: new Date(sos.createdAt).toLocaleString(),

      resolvedWithin: getResolvedWithin(sos.createdAt, sos.resolvedAt),

      location: sos.location?.coordinates || null,
      volunteers: sos.acceptedBy.map((v) => v.name),
    }));

    //  FORMAT HELPED SOS (user is volunteer)
    const formattedHelped = acceptedSOS.map((sos) => ({
      sentAt: new Date(sos.createdAt).toLocaleString(),

      resolvedWithin: getResolvedWithin(sos.createdAt, sos.resolvedAt),

      location: sos.location?.coordinates || null,

      victim: sos.isGuest ? "Guest User" : sos.userId?.name || "Unknown",
    }));

    return res.json({ 
      success: true,
      user,
      volunteer: volunteerData,
      trustedContacts,
      activeSOS: activeSOSData,
      sentSOS: formattedSent,
      acceptedSOS: formattedHelped,
    });
  } catch (err) {
    console.error("USER INFO ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


//admin fetch
exports.getAdminInfo = async (req, res) => {
  try {
    // optional: check admin
    if (req.user.userType !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // USERS
    const users = await User.find()
      .select("name email userType isSuspended createdAt lastActive");

    // SOS (populate sender + accepted volunteers)
    const sos = await SOS.find()
      .populate({
        path: "userId",
        select: "name email profilePic econtact",
      })
      .populate({
        path: "acceptedBy",
        select: "name email profilePic econtact",
      })
      .sort({ createdAt: -1 });

    //VOLUNTEERS (populate user details)
    const volunteers = await Volunteer.find()
      .populate({
        path: "userId",
        select: "name email profilePic econtact userType",
      })
      .sort({ createdAt: -1 });
const stats = {
  totalUsers: users.length,
  totalSOS: sos.length,
  activeSOS: sos.filter(s => s.status != "resolved").length,
  volunteers: volunteers.length,
};
    return res.json({
      success: true,
      data: {
        users,
        sos,
        volunteers,
        stats,
      },
    });
  } catch (err) {
    console.log("Admin fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};