const Volunteer = require("../models/Volunteer");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.applyVolunteer = async (req, res) => {
  try {
    const {
      name,
      phone,
      age,
      gender,
      address,
      skills,
      idType,
      idNumber,
    } = req.body;

    const userId = req.user?.userId; //from auth middleware
    //if user is alredy a volunteer or pending, block
    if (req.user?.userType === "volunteer" || req.user?.userType === "volunteer_pending") {
      return res.status(400).json({success: false, message: "You have already applied or are a volunteer"});
     }
    // validation
    if (!name || !phone || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const documentUrl = req.file ? req.file.path : null;

    // Create volunteer application
    const volunteer = await Volunteer.create({
      userId,
      name,
      phone,
      age,
      gender,
      address,
      skills,
      idType,
      idNumber,
      document: documentUrl,
      status: "pending",
    });

    // Update user status (IMPORTANT)
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await User.findByIdAndUpdate(
  userId,
  { userType: "volunteer_pending" },
  { new: true } 
);

const token = jwt.sign(
      {
        userId: user._id,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      volunteer,
      token,
      user: {
        name: user.name,
        email: user.email,
        userType: user.userType,
        userId: user._id,
        lastActive: user.lastActive,
        isSuspended: user.isSuspended,
      },
    });
  } catch (err) {
    console.log("Volunteer error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};