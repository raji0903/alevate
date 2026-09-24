const mongoose = require("mongoose");

const alumniProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        company: {
            type: String,
            trim: true
        },

        jobTitle: {
            type: String,
            trim: true
        },

        industry: {
            type: String,
            trim: true
        },

        experience: {
            type: Number,
            default: 0
        },

        skills: {
            type: [String],
            default: []
        },

        expertise: {
            type: [String],
            default: []
        },

        availability: {
            type: String,
            default: ""
        },

        bio: {
            type: String,
            trim: true
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
    "AlumniProfile",
    alumniProfileSchema
);