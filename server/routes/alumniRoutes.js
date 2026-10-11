const express = require("express");

const {
    createProfile,
    getProfile,
    updateProfile
} = require("../controllers/alumniController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/profile",
    protect,
    authorize("alumni"),
    createProfile
);

router.get(
    "/profile",
    protect,
    authorize("alumni"),
    getProfile
);

router.put(
    "/profile",
    protect,
    authorize("alumni"),
    updateProfile
);

module.exports = router;
