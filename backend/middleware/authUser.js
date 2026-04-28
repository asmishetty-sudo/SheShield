const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Always fetch fresh user from DB
    const user = await User.findById(decoded.userId);
 
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
   
    // Check suspension (REAL check, not token)
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Account suspended",
      });
    } 

    //  Update lastActive
    user.lastActive = new Date();
    await user.save();

    req.user = {
      userId: user._id,
      userType: user.userType,
    };
    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message); 
    return res.status(401).json({ message: "Invalid token" });
  }
};


const authMiddlewareInfo = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Always fetch fresh user from DB
    const user = await User.findById(decoded.userId);
 
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    //  Update lastActive
    user.lastActive = new Date();
    await user.save();

    req.user = {
      userId: user._id,
      userType: user.userType,
    };
    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message); 
    return res.status(401).json({ message: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.userType !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = { authMiddleware,authMiddlewareInfo,isAdmin };
