const validator = require("validator");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Volunteer = require("../models/Volunteer");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password ,econtact } = req.body;

    if (!name || !email || !password || !econtact) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email", success: false });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must contain uppercase, lowercase, number & symbol",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already used", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // default role assigned internally
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      econtact, 
      userType: "user", // default role
    });

    const token = jwt.sign(
      {
        userId: user._id,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    user.lastActive = new Date();
    await user.save();

    return res.status(201).json({
      message: "Registered and logged in successfully",
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        userType: user.userType,
        userId: user._id,
        isSuspended: user.isSuspended,
        lastActive: user.lastActive,
        econtact: user.econtact,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      success: false,
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => { 
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // CREATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        userType: user.userType,
        isSuspended: user.isSuspended,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15d" },
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        userType: user.userType,
        userId: user._id,
        isSuspended: user.isSuspended,
        lastActive: user.lastActive,
        profilePic: user.profilePic,
      },
      success: true,
      message: "Login successfull",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error", success: false, error: error.message });
  }
};

//change passwrod
//  /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
    if (!user) return res.status(401).json({ message: "Not logged in" });

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400) 
        .json({ message: "New password and confirm password must match" });
    }

    // Fetch user from DB
    const dbUser = await User.findById(user.userId);
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    dbUser.password = await bcrypt.hash(newPassword, 12);

    await dbUser.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// /api/auth/delete-account
exports.deleteAccount = async (req, res) => {
  try {
    // req.userId is set by your auth middleware (after verifying JWT)
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Delete the user
    await Volunteer.findOneAndDelete({ userId });
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
