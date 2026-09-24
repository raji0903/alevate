const express = require("express");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Any logged-in user
router.get("/profile", protect, (req, res) => {
    res.json({
        success: true,
        message: "You accessed a protected route",
        user: req.user
    });
});

// Student only
router.get("/student", protect, authorize("student"), (req, res) => {
    res.json({
        success: true,
        message: "Student access granted"
    });
});

// Alumni only
router.get("/alumni", protect, authorize("alumni"), (req, res) => {
    res.json({
        success: true,
        message: "Alumni access granted"
    });
});

// Admin only
router.get("/admin", protect, authorize("admin"), (req, res) => {
    res.json({
        success: true,
        message: "Admin access granted"
    });
});

module.exports = router;