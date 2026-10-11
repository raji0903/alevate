const express = require("express");
const {
    getJobs,
    getJobById,
    createJob,
    applyJob,
    getMyApplications
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getJobs);
router.get("/my-applications", protect, authorize("student"), getMyApplications);
router.get("/:id", getJobById);
router.post("/", protect, authorize("alumni", "admin"), createJob);
router.post("/:id/apply", protect, authorize("student"), applyJob);

module.exports = router;
