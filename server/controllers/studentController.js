const StudentProfile = require("../models/StudentProfile");

// Create student profile
const createProfile = async (req, res) => {
    try {
        const existingProfile = await StudentProfile.findOne({
            user: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Student profile already exists"
            });
        }

        const profile = await StudentProfile.create({
            user: req.user.userId,
            college: req.body.college,
            department: req.body.department,
            graduationYear: req.body.graduationYear,
            bio: req.body.bio,
            skills: req.body.skills,
            interests: req.body.interests,
            careerGoals: req.body.careerGoals,
            resume: req.body.resume,
            socialLinks: req.body.socialLinks
        });

        res.status(201).json({
            success: true,
            message: "Student profile created successfully",
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create student profile",
            error: error.message
        });
    }
};


// Get student profile
const getProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
            user: req.user.userId
        }).populate("user", "name email role profileImage");

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        res.status(200).json({
            success: true,
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get student profile",
            error: error.message
        });
    }
};


// Update student profile
const updateProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
            user: req.user.userId
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found"
            });
        }

        Object.assign(profile, req.body);

        await profile.save();

        res.status(200).json({
            success: true,
            message: "Student profile updated successfully",
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update student profile",
            error: error.message
        });
    }
};


module.exports = {
    createProfile,
    getProfile,
    updateProfile
};