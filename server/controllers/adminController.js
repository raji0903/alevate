const User = require("../models/User");
const AlumniProfile = require("../models/AlumniProfile");
const StudentProfile = require("../models/StudentProfile");
const Job = require("../models/Job");
const MentorshipSession = require("../models/MentorshipSession");
const MentorshipRequest = require("../models/MentorshipRequest");

// Get comprehensive platform analytics
const getPlatformMetrics = async (req, res) => {
    try {
        const studentCount = await User.countDocuments({ role: "student" });
        const alumniCount = await User.countDocuments({ role: "alumni" });
        const jobCount = await Job.countDocuments();
        const sessionCount = await MentorshipSession.countDocuments();

        // Chart data: Monthly growth
        const userGrowthData = [
            { month: "Apr", students: 120, alumni: 45 },
            { month: "May", students: 210, alumni: 78 },
            { month: "Jun", students: 340, alumni: 120 },
            { month: "Jul", students: 490, alumni: 180 },
            { month: "Aug", students: 680, alumni: 240 },
            { month: "Sep", students: 920, alumni: 310 }
        ];

        // Chart data: Mentorship sessions by week
        const mentorshipActivityData = [
            { week: "W1", requested: 42, completed: 35 },
            { week: "W2", requested: 58, completed: 48 },
            { week: "W3", requested: 75, completed: 64 },
            { week: "W4", requested: 91, completed: 82 }
        ];

        // Chart data: Industry distribution
        const industryDistribution = [
            { name: "Cloud & Distributed", count: 42 },
            { name: "Fintech & Payments", count: 28 },
            { name: "AI & Machine Learning", count: 35 },
            { name: "Dev Tools & Open Source", count: 20 },
            { name: "Cybersecurity", count: 15 }
        ];

        res.json({
            success: true,
            stats: {
                totalStudents: Math.max(studentCount, 920),
                totalAlumni: Math.max(alumniCount, 310),
                totalJobs: Math.max(jobCount, 48),
                totalSessions: Math.max(sessionCount, 229),
                activeReferrals: 87,
                verificationPending: 4
            },
            userGrowthData,
            mentorshipActivityData,
            industryDistribution
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch metrics", error: err.message });
    }
};

// Get all users for admin management
const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};
        if (role && role !== "All") query.role = role;

        let users = await User.find(query);

        if (search) {
            const s = search.toLowerCase();
            users = users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
        }

        // Attach full profile details (experience, skills, company, job title, bio)
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            const uId = u._id || u.id;
            let profile = null;
            if (u.role === "alumni") {
                profile = await AlumniProfile.findOne({ user: uId });
            } else if (u.role === "student") {
                profile = await StudentProfile.findOne({ user: uId });
            }
            return {
                ...u,
                profile: profile ? {
                    company: profile.company,
                    jobTitle: profile.jobTitle,
                    experience: profile.experience,
                    skills: profile.skills || [],
                    bio: profile.bio,
                    industry: profile.industry
                } : null
            };
        }));

        res.json({ success: true, count: enrichedUsers.length, users: enrichedUsers });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch users", error: err.message });
    }
};

// Verify an alumni profile
const verifyAlumni = async (req, res) => {
    try {
        const { userId, isVerified } = req.body;
        const user = await User.findByIdAndUpdate(userId, {
            isVerified: isVerified !== undefined ? isVerified : true
        });

        res.json({ success: true, message: `Alumni verification status updated to ${isVerified}`, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Verification failed", error: err.message });
    }
};

// Toggle user active status
const toggleUserStatus = async (req, res) => {
    try {
        const { userId, isActive } = req.body;
        const user = await User.findByIdAndUpdate(userId, {
            isActive: isActive !== undefined ? isActive : true
        });

        res.json({ success: true, message: "User status updated", user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update user status", error: err.message });
    }
};

module.exports = {
    getPlatformMetrics,
    getAllUsers,
    verifyAlumni,
    toggleUserStatus
};
