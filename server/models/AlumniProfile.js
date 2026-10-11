const mongoose = require("mongoose");
const { MockAlumniProfile } = require("./mockStore");

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

const MongooseAlumniProfile = mongoose.models.AlumniProfile || mongoose.model(
    "AlumniProfile",
    alumniProfileSchema
);

const AlumniProfileProxy = new Proxy(MongooseAlumniProfile, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockAlumniProfile) {
            return MockAlumniProfile[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = AlumniProfileProxy;
