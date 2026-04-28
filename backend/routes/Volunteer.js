
const express=require("express");
const upload = require("../middleware/upload");
const { applyVolunteer } = require("../controllers/volunteerControllers");
const { authMiddleware } = require("../middleware/authUser");
const router=express.Router()

router.post("/apply",authMiddleware, upload.single("document"), applyVolunteer);

module.exports = router;