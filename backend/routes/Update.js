const express = require("express");
const { authMiddleware } = require("../middleware/authUser");
const { addTrusted, getTrusted, deleteTrusted, updateProfilePic, updateName, updateAddress, updateLocation } = require("../controllers/updateController");
const upload = require("../middleware/upload");
const router = express.Router();


router.post("/", authMiddleware, addTrusted);
router.delete("/:id", authMiddleware, deleteTrusted);
router.post("/profile-pic",authMiddleware,upload.single("image"),updateProfilePic); 
router.put("/name", authMiddleware, updateName);
router.put("/address", authMiddleware, updateAddress);
router.post("/update-location", authMiddleware, updateLocation);

module.exports = router;