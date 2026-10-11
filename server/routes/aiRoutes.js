const express = require("express");
const {
    careerCompanionChat,
    matchJobSkills,
    recommendMentors,
    recommendJobs,
    analyzeResume
} = require("../controllers/aiController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/chat", protect, careerCompanionChat);
router.post("/match-skills", protect, matchJobSkills);
router.get("/recommend-mentors", protect, authorize("student"), recommendMentors);
router.get("/recommend-jobs", protect, authorize("student"), recommendJobs);
router.post("/analyze-resume", protect, authorize("student"), analyzeResume);

module.exports = router;
