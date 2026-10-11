const express = require("express");
const {
    requestReferral,
    getStudentReferrals,
    getAlumniReferrals,
    updateReferralStatus
} = require("../controllers/referralController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("student"), requestReferral);
router.get("/student", protect, authorize("student"), getStudentReferrals);
router.get("/alumni", protect, authorize("alumni"), getAlumniReferrals);
router.put("/:id/status", protect, authorize("alumni"), updateReferralStatus);

module.exports = router;
