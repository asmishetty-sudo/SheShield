const SOS = require("../models/SOS");
const User = require("../models/User");
const sendEmail = require("../services/emailServices");
const sendWhatsApp = require("../services/whatsappService");
const { getIO, onlineUsers } = require("../socket");

const sendSOSToVolunteers = async (
  user,
  location,
  io,
  sosId,
  attemptLevel = 1,
) => {
  const maxDistance =
    attemptLevel === 1 ? 5000 : attemptLevel === 2 ? 10000 : 20000;

  // get volunteers near location
  const volunteers = await User.find({
    userType: "volunteer",
    isSuspended: false,
    _id: { $ne: user._id },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
        $maxDistance: maxDistance,
      },
    },
  });

  //  FILTER ONLY ONLINE USERS
  const onlineVolunteers = volunteers.filter((v) =>
    onlineUsers.has(v._id.toString()),
  );

  // EMIT SOS ALERT (your correct format)
  onlineVolunteers.forEach((v) => {
    const socketId = onlineUsers.get(v._id.toString());

    if (socketId) {
      io.to(socketId).emit("sos-alert", {
        sosId,
        userId: user._id,
        from: user.name,

        message: "🚨 Someone needs help near you",

        location: {
          lat: user.location.coordinates[1],
          lng: user.location.coordinates[0],
        },

        econtact: user.econtact || "Not available",

        attemptLevel,
      });
    }
  });

  return onlineVolunteers.length;
};

// ================= USER SOS =================
exports.triggerSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { location } = req.body;
    const io = getIO();

    //  validate input
    if (!location?.lat || !location?.lng) {
      return res.status(400).json({
        success: false,
        message: "Invalid location",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  cooldown check FIRST (fix bug)
    if (user.lastSOS && Date.now() - user.lastSOS.getTime() < 30000) {
      return res.status(400).json({
        success: false,
        message: "Wait 30 seconds before sending another SOS",
      });
    }

    //  active SOS check
    if (user.activeSOS) {
      const existingSOS = await SOS.findById(user.activeSOS);

      if (existingSOS && existingSOS.status === "active") {
        return res.status(400).json({
          success: false,
          message: "You already have an active SOS",
        });
      }
    }

    //  create SOS FIRST
    const sos = await SOS.create({
      userId,
      isGuest: false,
      status: "active",
      attemptLevel: 1,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    });

    // update user AFTER sos creation
    user.activeSOS = sos._id;
    user.lastSOS = new Date();
    user.location = {
      type: "Point",
      coordinates: [location.lng, location.lat],
    };
    await user.save();

    //  trusted contacts (non-blocking improvement)
    if (user.trusted?.length) {
      const locationLink = `https://maps.google.com/?q=${location.lat},${location.lng}`;
      const message = `EMERGENCY ALERT 🚨 ${user.name} needs help!\nLocation: ${locationLink}`;

      user.trusted.forEach(async (person) => {
        try {
          if (person.email) {
            await sendEmail(person.email, "🚨 SheShield SOS Alert", message);
          }
          // send whatsapp 
        //   if (person.phone) {
        //   await sendWhatsApp(person.phone, message);
        // }
        } catch (err) {
          console.error("Trusted alert error:", err.message);
        }
      });
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const escalate = async (level) => {
      const currentSOS = await SOS.findById(sos._id);
      if (!currentSOS || currentSOS.status === "resolved") return;

      const found = await sendSOSToVolunteers(
        user,
        location,
        io,
        sos._id,
        level,
      );

      await sleep(120000); // WAIT RESPONSE WINDOW (realistic 2min)

      const updated = await SOS.findById(sos._id);

      // STOP if accepted
      if (updated.status == "accepted" ||updated.status == "resolved" ||  updated.acceptedBy?.length > 0) {
        console.log("✅ SOS already handled. stopping escalation.");
        return;
      }

      const nextLevel = level + 1; 

      if (nextLevel <= 3) {
        await SOS.findByIdAndUpdate(sos._id, {
          attemptLevel: nextLevel,
          status: "escalated",
        });

        return escalate(nextLevel); // IMPORTANT: return recursion
      }
      await sendEmail(
        process.env.ADMIN_EMAIL,
        "🚨 ADMIN SOS ALERT",
        `${user.name} needs urgent help!\nContact:${user.econtact}\nLocation: https://maps.google.com/?q=${location.lat},${location.lng}`,
      );
    };

    // start escalation 
    escalate(1);

    return res.json({
      success: true,
      message: "SOS triggered successfully",
      sosId: sos._id,
    });
  } catch (err) {
    console.log("SOS error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ================= GUEST SOS =================
exports.triggerGuestSOS = async (req, res) => {
  try {
    const { location } = req.body;
    const io = getIO();

    if (!location?.lat || !location?.lng) {
      return res.status(400).json({
        success: false,
        message: "Location required",
      });
    }

    const guestId = req.headers["x-guest-id"];

    if (!guestId) {
      return res.status(400).json({ message: "Guest ID required" });
    }
    const existing = await SOS.findOne({
  guestId,
   status: { $in: ["active", "accepted", "escalated"] },
});
    // BLOCK if active
    if (existing && existing.status === "active") {
      return res.status(400).json({
        success: false,
        message: "You already have an active SOS",
      });
    }

    //cooldown
const lastSOS = await SOS.findOne({ guestId }).sort({ createdAt: -1 });

if (lastSOS && Date.now() - new Date(lastSOS.createdAt) < 60000) {
  return res.status(400).json({
    success: false,
    message: "Wait before sending another SOS",
  });
}

    //find volunteers
    const volunteers = await User.find({
      userType: "volunteer",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          $maxDistance: 5000,
        },
      },
    }).limit(5);

    const sos = await SOS.create({
      userId: null,
      isGuest: true,
       guestId: guestId,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
    });

    // emit
    volunteers.forEach((v) => {
      const socketId = onlineUsers.get(v._id.toString());

      if (socketId) {
        io.to(socketId).emit("sos-alert", {
          sosId: sos._id,
          message: "🚨 Someone needs help near you",
          from: "Guest User",
          isGuest: true,
          location,
          econtact: "Not available",
        });
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error" });
  }
};

// accept sos
exports.acceptSOS = async (req, res) => {
  try {
    const io = getIO();
    const sosId = req.params.id;
    const volunteerId = req.user.userId;

    if (req.user.userType !== "volunteer") {
      return res
        .status(403)
        .json({ message: "Only volunteers can accept SOS" });
    }
    const sos = await SOS.findById(sosId);
    if (!sos) {
      return res.status(404).json({ message: "SOS not found" });
    }

    if (sos.status === "resolved") {
      return res.status(400).json({ message: "Already resolved" });
    }

    // ensure array exists
    if (!sos.acceptedBy) sos.acceptedBy = [];

    // FIX: ObjectId comparison
    const alreadyAccepted = sos.acceptedBy.some(
      (id) => id.toString() === volunteerId,
    );

    if (!alreadyAccepted) {
      sos.acceptedBy.push(volunteerId);
    }
    sos.status = "accepted";
    sos.acceptedAt = new Date();
    await sos.save();
    const volunteerUser = await User.findById(volunteerId);
    volunteerUser.activeSOS = sos._id;
    await volunteerUser.save();
    const volunteer =
      await User.findById(volunteerId).select("name profilePic");

    const userId = sos.userId?.toString();

    const userSocket = onlineUsers.get(userId);

    if (userSocket) {
      io.to(userSocket).emit("sos-accepted", {
        sosId,
        volunteer,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.log("ACCEPT ERROR:", err);
    res.status(500).json({ message: "Error" });
  }
};

// GET /api/sos/active
exports.getActiveSOS = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate({
      path: "activeSOS",
      populate: [
        {
          path: "acceptedBy",
          select: "name profilePic econtact",
        },
        {
          path: "userId", // ADD THIS
          select: "name econtact profilePic", // AND THIS
        },
      ],
    });

    if (!user || !user.activeSOS) {
      return res.json({ success: true, sos: null,mes });
    }

    const sos = user.activeSOS;

    let role = "viewer";

    const sosUserId = sos.userId?._id
      ? sos.userId._id.toString()
      : sos.userId?.toString();

    if (sosUserId === userId.toString()) {
      role = "sender";
    } else if (
      sos.acceptedBy &&
      sos.acceptedBy.some(
        (v) => (v._id ? v._id.toString() : v.toString()) === userId.toString(),
      )
    ) {
      role = "accepted";
    }

    const formatted = {
      sosId: sos._id,
      senderName: sos.userId?.name || "Unknown",
      senderPic: sos.userId?.profilePic || null,
      role, // THIS IS THE KEY
      location: {
        lat: sos.location.coordinates[1],
        lng: sos.location.coordinates[0],
      },
      econtact: sos.userId?.econtact || "Not available",
      volunteers: sos.acceptedBy || [],
    };

    res.json({ success: true, sos: formatted });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

//guest
exports.getGuestActiveSOS = async (req, res) => {
  try {
    const guestId = req.headers["x-guest-id"];

    if (!guestId) {
      return res.status(400).json({ message: "Guest ID required" });
    }
    const sos = await SOS.findOne({
  guestId,
  status: { $in: ["active", "accepted", "escalated"] },
}).populate({
  path: "acceptedBy",
  select: "name profilePic econtact",
});

if (!sos) {
  return res.json({ success: true, sos: null });
}
    

    const formatted = {
      sosId: sos._id,
      role: "sender", // guest is always sender
      isGuest: true,
      from: "Guest User",

      location: {
        lat: sos.location.coordinates[1],
        lng: sos.location.coordinates[0],
      },

      econtact: "Not available",
      volunteers: sos.acceptedBy || [],
    };

    res.json({ success: true, sos: formatted });
  } catch (err) {
    console.log("GUEST ACTIVE ERROR:", err);
    res.status(500).json({ message: "Error" });
  }
};

//resolve sos
exports.resolveSOS = async (req, res) => {
  try {
    const io = getIO();
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({ message: "SOS not found" });
    }

    sos.status = "resolved";
    sos.resolvedAt = new Date();
    await sos.save();

    //CLEAR USER ACTIVE SOS
    if (sos.userId) {
      await User.findByIdAndUpdate(sos.userId, { activeSOS: null });
    }
    if (sos.isGuest) {
      return res.status(400).json({
        message: "Unauthorised",
      });
    }
    // CLEAR VOLUNTEERS ACTIVE SOS + NOTIFY THEM
    for (const volunteerId of sos.acceptedBy) {
      await User.findByIdAndUpdate(volunteerId, { activeSOS: null });

      const socketId = onlineUsers.get(volunteerId.toString());
      if (socketId) {
        io.to(socketId).emit("sos-resolved", {
          sosId: sos._id,
        });
      }
    }

    // ALSO NOTIFY OWNER
    if (sos.userId) {
      const userSocket = onlineUsers.get(sos.userId.toString());
      if (userSocket) {
        io.to(userSocket).emit("sos-resolved", {
          sosId: sos._id,
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.log("RESOLVE ERROR:", err);
    res.status(500).json({ message: "Error" });
  }
};

//guest resolvee
exports.resolveGuestSOS = async (req, res) => {
  try {
    const io = getIO();
    const guestId = req.headers["x-guest-id"];

    if (!guestId) {
      return res.status(400).json({ message: "Guest ID required" });
    }
    if (!global.guestSOSMap) global.guestSOSMap = new Map();
    const guestData = global.guestSOSMap.get(guestId);

    if (!guestData || guestData.status !== "active") {
      return res.status(400).json({ message: "No active SOS" });
    }

    const sos = await SOS.findById(guestData.sosId);

    if (!sos) {
      return res.status(404).json({ message: "SOS not found" });
    }

    //resolve
    sos.status = "resolved";
    sos.resolvedAt = new Date();
    await sos.save();

    // update guest memory
    global.guestSOSMap.set(guestId, {
      ...guestData,
      status: "resolved",
    });

    // notify volunteers
    for (const volunteerId of sos.acceptedBy) {
      await User.findByIdAndUpdate(volunteerId, { activeSOS: null });

      const socketId = onlineUsers.get(volunteerId.toString());
      if (socketId) {
        io.to(socketId).emit("sos-resolved", {
          sosId: sos._id,
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.log("GUEST RESOLVE ERROR:", err);
    res.status(500).json({ message: "Error" });
  }
};
