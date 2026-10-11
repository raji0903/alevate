const express = require("express");
const {
    getPlatformMetrics,
    getAllUsers,
    verifyAlumni,
    toggleUserStatus
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/metrics", protect, authorize("admin"), getPlatformMetrics);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/verify-alumni", protect, authorize("admin"), verifyAlumni);
router.put("/toggle-user-status", protect, authorize("admin"), toggleUserStatus);

module.exports = router;
