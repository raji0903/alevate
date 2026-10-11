const mongoose = require("mongoose");
const { MockStudentProfile } = require("./mockStore");

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

const MongooseStudentProfile = mongoose.models.StudentProfile || mongoose.model(
    "StudentProfile",
    studentProfileSchema
);

const StudentProfileProxy = new Proxy(MongooseStudentProfile, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockStudentProfile) {
            return MockStudentProfile[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = StudentProfileProxy;
