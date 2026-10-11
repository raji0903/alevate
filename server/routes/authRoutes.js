const express = require("express");

const {
    registerUser,
    loginUser,
    googleAuth,
    googleCallback,
    githubAuth,
    githubCallback
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// GitHub OAuth
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);

module.exports = router;