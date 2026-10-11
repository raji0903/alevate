const express = require("express");

const {
    createProfile,
    getProfile,
    updateProfile
} = require("../controllers/studentController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/profile",
    protect,
    authorize("student"),
    createProfile
);

router.get(
    "/profile",
    protect,
    authorize("student"),
    getProfile
);

router.put(
    "/profile",
    protect,
    authorize("student"),
    updateProfile
);

module.exports = router;