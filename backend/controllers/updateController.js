const User = require("../models/User");
const validator = require("validator");
const Volunteer = require("../models/Volunteer");

// Add trusted contact
exports.addTrusted = async (req, res) => {
  try {
    const userId = req.user.userId;
    let { name, phone, email } = req.body;

    // Trim inputs
    name = name?.trim();
    phone = phone?.trim();
    email = email?.trim();

    //  Name required
    if (!name) {
      return res.status(400).json({ success: false, message: "Name required" });
    }

    // Validate phone (E.164)
    if (phone) {
      const phoneRegex = /^\+[1-9]\d{7,14}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone format (use +countrycode)",
        });
      }
    }

    // Validate email
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const user = await User.findById(userId);

    // Prevent duplicates (same phone OR email)
    const alreadyExists = user.trusted.some(
      (t) =>
        (phone && t.phone === phone) ||
        (email && t.email === email)
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Contact already exists",
      });
    }

    //  Limit contacts (optional but recommended)
    if (user.trusted.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 trusted contacts allowed",
      });
    }

    // ✅ Save clean data
    user.trusted.push({
      name,
      phone: phone || "",
      email: email || "",
    });

    await user.save();

    res.json({ success: true, trusted: user.trusted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete trusted contact
exports.deleteTrusted = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.userId);

    user.trusted = user.trusted.filter(
      (t) => t._id.toString() !== id
    );

    await user.save();

    res.json({ success: true, trusted: user.trusted });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//update profile picture
exports.updateProfilePic = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    //multer-storage-cloudinary already gives this
    const imageUrl = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: imageUrl },
      { new: true }
    ).select("-password");

    return res.json({
      success: true,
      message: "Profile picture updated",
      imageUrl,
      user: updatedUser,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Upload failed" });
  }
};

exports.updateName = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Invalid name",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Name updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// UPDATE VOLUNTEER ADDRESS
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { address } = req.body;

    if (!address || address.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Invalid address",
      });
    }

    // find volunteer linked to user
    const volunteer = await Volunteer.findOneAndUpdate(
      { userId },
      { address: address.trim() },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: "Volunteer profile not found",
      });
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      volunteer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.updateLocation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lat, lng } = req.body;
    if (
      lat === undefined ||
      lng === undefined ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location data",
      });
    }
    const user = await User.findById(userId);
    // Save location
    user.location = {
      type: "Point",
      coordinates: [lng, lat],        //[lng, lat]
    };
    await user.save();
    return res.json({
      success: true,
      message: "Location updated",
    });
  } catch (err) {
    console.error("LOCATION UPDATE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};