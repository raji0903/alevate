const Job = require("../models/Job");
const User = require("../models/User");

// Get all jobs with filtering
const getJobs = async (req, res) => {
    try {
        const { search, type, location, industry, experienceLevel } = req.query;
        let query = {};

        if (type && type !== "All") query.type = type;
        if (industry && industry !== "All") query.industry = industry;
        if (experienceLevel && experienceLevel !== "All") query.experienceLevel = experienceLevel;

        let jobs = await Job.find(query).sort({ createdAt: -1 });

        if (search) {
            const s = search.toLowerCase();
            jobs = jobs.filter(j =>
                j.title.toLowerCase().includes(s) ||
                j.company.toLowerCase().includes(s) ||
                j.skillsRequired.some(skill => skill.toLowerCase().includes(s)) ||
                j.location.toLowerCase().includes(s)
            );
        }

        if (location && location !== "All") {
            jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
        }

        res.json({ success: true, count: jobs.length, jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch jobs", error: err.message });
    }
};

// Get single job
const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });
        res.json({ success: true, job });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching job", error: err.message });
    }
};

// Post a new job (Alumni & Admin)
const createJob = async (req, res) => {
    try {
        const { title, company, location, type, industry, experienceLevel, skillsRequired, description, salary, referralAvailable } = req.body;

        if (!title || !company || !description) {
            return res.status(400).json({ success: false, message: "Title, company, and description are required" });
        }

        const job = await Job.create({
            title,
            company,
            location: location || "Remote",
            type: type || "Full-time",
            industry: industry || "Technology",
            experienceLevel: experienceLevel || "Entry-level",
            skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : (skillsRequired ? skillsRequired.split(",").map(s => s.trim()) : []),
            description,
            salary: salary || "$80k - $120k",
            referralAvailable: referralAvailable !== undefined ? referralAvailable : true,
            postedBy: req.user.userId
        });

        res.status(201).json({ success: true, message: "Job opportunity posted successfully", job });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to create job", error: err.message });
    }
};

// Apply to a job (Student)
const applyJob = async (req, res) => {
    try {
        const { resume, resumeFileName, resumeFileSize, notes } = req.body;
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        // Check if already applied
        const alreadyApplied = job.applicants && job.applicants.some(a => a.user?.toString() === req.user.userId || a.user?._id?.toString() === req.user.userId);
        if (alreadyApplied) {
            return res.status(409).json({ success: false, message: "You have already applied for this position" });
        }

        const newApplicant = {
            user: req.user.userId,
            appliedAt: new Date(),
            resume: resume || "",
            resumeFileName: resumeFileName || (resume ? "Uploaded_Resume.pdf" : ""),
            resumeFileSize: resumeFileSize || "",
            notes: notes || "",
            status: "pending"
        };

        await Job.findByIdAndUpdate(req.params.id, {
            $push: { applicants: newApplicant }
        });

        res.json({ success: true, message: "Application submitted successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to submit application", error: err.message });
    }
};

// Get user's applied jobs
const getMyApplications = async (req, res) => {
    try {
        const allJobs = await Job.find();
        const appliedJobs = [];

        for (const job of allJobs) {
            const app = (job.applicants || []).find(a =>
                a.user?.toString() === req.user.userId || a.user?._id?.toString() === req.user.userId
            );
            if (app) {
                appliedJobs.push({
                    job,
                    application: app
                });
            }
        }

        res.json({ success: true, appliedJobs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch applications", error: err.message });
    }
};

module.exports = {
    getJobs,
    getJobById,
    createJob,
    applyJob,
    getMyApplications
};
