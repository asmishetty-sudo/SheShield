const express = require("express");
const { authMiddleware, isAdmin, authMiddlewareInfo } = require("../middleware/authUser");
const { getUserInfo, getAdminInfo } = require("../controllers/infoController");
const router = express.Router();


router.get("/user", authMiddlewareInfo, getUserInfo);
router.get("/admin", authMiddleware, isAdmin, getAdminInfo); 


module.exports = router;