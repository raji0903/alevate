const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        college: {
            type: String,
            trim: true
        },

        department: {
            type: String,
            trim: true
        },

        graduationYear: {
            type: Number
        },

        bio: {
            type: String,
            trim: true
        },

        skills: {
            type: [String],
            default: []
        },

        interests: {
            type: [String],
            default: []
        },

        careerGoals: {
            type: [String],
            default: []
        },

        resume: {
            type: String,
            default: ""
        },

        socialLinks: {
            linkedin: {
                type: String,
                default: ""
            },
            github: {
                type: String,
                default: ""
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "StudentProfile",
    studentProfileSchema
);