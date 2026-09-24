const AlumniProfile = require("../models/AlumniProfile");

// Create alumni profile
const createProfile = async (req, res) => {
    try {
        const existingProfile = await AlumniProfile.findOne({
            user: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Alumni profile already exists"
            });
        }

        const profile = await AlumniProfile.create({
            user: req.user.userId,
            company: req.body.company,
            jobTitle: req.body.jobTitle,
            industry: req.body.industry,
            experience: req.body.experience,
            skills: req.body.skills,
            expertise: req.body.expertise,
            availability: req.body.availability,
            bio: req.body.bio,
            socialLinks: req.body.socialLinks
        });

        res.status(201).json({
            success: true,
            message: "Alumni profile created successfully",
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create alumni profile",
            error: error.message
        });
    }
};


// Get alumni profile
const getProfile = async (req, res) => {
    try {
        const profile = await AlumniProfile.findOne({
            user: req.user.userId
        }).populate("user", "name email role profileImage");

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        res.status(200).json({
            success: true,
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get alumni profile",
            error: error.message
        });
    }
};


// Update alumni profile
const updateProfile = async (req, res) => {
    try {
        const profile = await AlumniProfile.findOne({
            user: req.user.userId
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Alumni profile not found"
            });
        }

        Object.assign(profile, req.body);

        await profile.save();

        res.status(200).json({
            success: true,
            message: "Alumni profile updated successfully",
            profile
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update alumni profile",
            error: error.message
        });
    }
};


module.exports = {
    createProfile,
    getProfile,
    updateProfile
};