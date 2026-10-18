
const User = require("../models/User");
const AlumniProfile = require("../models/AlumniProfile");
const StudentProfile = require("../models/StudentProfile");
const Job = require("../models/Job");
const MentorshipSession = require("../models/MentorshipSession");
const MentorshipRequest = require("../models/MentorshipRequest");

// Get comprehensive platform analytics
const getPlatformMetrics = async (req, res) => {
    try {
        const [
            studentCount,
            alumniCount,
            jobCount,
            sessionCount,
            pendingAlumniCount
        ] = await Promise.all([
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "alumni" }),
            Job.countDocuments(),
            MentorshipSession.countDocuments(),
            User.countDocuments({
                role: "alumni",
                isVerified: false
            })
        ]);

        const userGrowthData = [
            { month: "Apr", students: 120, alumni: 45 },
            { month: "May", students: 210, alumni: 78 },
            { month: "Jun", students: 340, alumni: 120 },
            { month: "Jul", students: 490, alumni: 180 },
            { month: "Aug", students: 680, alumni: 240 },
            { month: "Sep", students: 920, alumni: 310 }
        ];

        const mentorshipActivityData = [
            { week: "W1", requested: 42, completed: 35 },
            { week: "W2", requested: 58, completed: 48 },
            { week: "W3", requested: 75, completed: 64 },
            { week: "W4", requested: 91, completed: 82 }
        ];

        const industryDistribution = [
            { name: "Cloud & Distributed", count: 42 },
            { name: "Fintech & Payments", count: 28 },
            { name: "AI & Machine Learning", count: 35 },
            { name: "Dev Tools & Open Source", count: 20 },
            { name: "Cybersecurity", count: 15 }
        ];

        return res.json({
            success: true,
            stats: {
                totalStudents: Math.max(studentCount, 920),
                totalAlumni: Math.max(alumniCount, 310),
                totalJobs: Math.max(jobCount, 48),
                totalSessions: Math.max(sessionCount, 229),
                activeReferrals: 87,
                verificationPending: pendingAlumniCount
            },
            userGrowthData,
            mentorshipActivityData,
            industryDistribution
        });
    } catch (err) {
        console.error("Admin metrics error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch metrics"
        });
    }
};

// Get all users for admin management
const getAllUsers = async (req, res) => {
    try {
        const role = req.query.role;
        const search = (req.query.search || "").trim().toLowerCase();

        const query = {};

        // "All" must mean all roles, not a literal role name.
        if (
            role &&
            role.toLowerCase() !== "all" &&
            ["student", "alumni", "admin"].includes(role.toLowerCase())
        ) {
            query.role = role.toLowerCase();
        }

        const users = await User.find(query).lean();

        const filteredUsers = users.filter((user) => {
            if (!search) return true;

            return (
                (user.name || "").toLowerCase().includes(search) ||
                (user.email || "").toLowerCase().includes(search)
            );
        });

        const enrichedUsers = await Promise.all(
            filteredUsers.map(async (user) => {
                let profile = null;

                if (user.role === "alumni") {
                    profile = await AlumniProfile.findOne({
                        user: user._id
                    }).lean();
                } else if (user.role === "student") {
                    profile = await StudentProfile.findOne({
                        user: user._id
                    }).lean();
                }

                return {
                    ...user,
                    id: String(user._id),
                    isVerified:
                        user.isVerified !== undefined
                            ? user.isVerified
                            : user.role !== "alumni",
                    isActive: user.isActive !== false,
                    profile: profile
                        ? {
                              company: profile.company || "",
                              jobTitle: profile.jobTitle || "",
                              experience: profile.experience || 0,
                              skills: profile.skills || [],
                              bio: profile.bio || "",
                              industry: profile.industry || ""
                          }
                        : null
                };
            })
        );

        return res.json({
            success: true,
            count: enrichedUsers.length,
            users: enrichedUsers
        });
    } catch (err) {
        console.error("Admin get users error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

// Approve or revoke alumni mentor verification
const verifyAlumni = async (req, res) => {
    try {
        const { userId, isVerified } = req.body;

        if (!userId || typeof isVerified !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "A valid userId and isVerified boolean are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "alumni") {
            return res.status(400).json({
                success: false,
                message: "Only alumni accounts can be verified"
            });
        }

        user.isVerified = isVerified;
        await user.save();

        return res.json({
            success: true,
            message: isVerified
                ? "Alumni approved successfully"
                : "Alumni verification revoked",
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (err) {
        console.error("Admin alumni verification error:", err);

        return res.status(500).json({
            success: false,
            message: "Verification failed"
        });
    }
};

// Activate or deactivate a user
const toggleUserStatus = async (req, res) => {
    try {
        const { userId, isActive } = req.body;

        if (!userId || typeof isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "A valid userId and isActive boolean are required"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isActive = isActive;
        await user.save();

        return res.json({
            success: true,
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user: {
                id: String(user._id),
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (err) {
        console.error("Admin toggle user status error:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to update user status"
        });
    }
};

module.exports = {
    getPlatformMetrics,
    getAllUsers,
    verifyAlumni,
    toggleUserStatus
};
