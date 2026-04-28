const express = require("express");
const router = express.Router();
const {
  toggleSuspendUser,
  deleteUser,
  approveVolunteer,
  rejectVolunteer,
} = require("../controllers/adminController");
const { isAdmin, authMiddleware } = require("../middleware/authUser");

router.patch("/users/:id/suspend",authMiddleware, isAdmin, toggleSuspendUser);
router.delete("/users/:id",authMiddleware, isAdmin, deleteUser);
router.patch("/volunteer/:id/approve", authMiddleware, isAdmin, approveVolunteer);
router.patch("/volunteer/:id/reject", authMiddleware, isAdmin, rejectVolunteer);

module.exports = router;