const express = require("express");
const {
    getMentors,
    requestMentorship,
    getStudentRequests,
    getAlumniRequests,
    respondToRequest,
    getSessions,
    scheduleSession
} = require("../controllers/mentorshipController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/mentors", getMentors);
router.post("/request", protect, authorize("student"), requestMentorship);
router.get("/requests/student", protect, authorize("student"), getStudentRequests);
router.get("/requests/alumni", protect, authorize("alumni"), getAlumniRequests);
router.put("/requests/:id/respond", protect, authorize("alumni"), respondToRequest);
router.get("/sessions", protect, getSessions);
router.post("/sessions", protect, scheduleSession);

module.exports = router;
