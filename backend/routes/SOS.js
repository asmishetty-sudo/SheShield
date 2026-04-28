
const express=require("express");
const { triggerSOS, triggerGuestSOS, acceptSOS, resolveSOS, getActiveSOS ,getGuestActiveSOS, resolveGuestSOS } = require("../controllers/sosController");
const { authMiddleware } = require("../middleware/authUser");
const router=express.Router()

router.post("/trigger",authMiddleware, triggerSOS)

router.post("/resolve/:id",authMiddleware, resolveSOS)
router.post("/accept/:id", authMiddleware, acceptSOS);
router.get("/active", authMiddleware, getActiveSOS);

//guest sos
router.post("/guest", triggerGuestSOS);
router.get("/guest-active", getGuestActiveSOS);
router.post("/guest-resolve", resolveGuestSOS);
module.exports = router;