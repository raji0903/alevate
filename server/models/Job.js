const mongoose = require("mongoose");
const { MockJob } = require("./mockStore");

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        company: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: ["Full-time", "Part-time", "Internship", "Remote", "Contract"],
            default: "Full-time"
        },
        industry: {
            type: String,
            default: "Technology"
        },
        experienceLevel: {
            type: String,
            default: "Entry-level"
        },
        skillsRequired: {
            type: [String],
            default: []
        },
        description: {
            type: String,
            required: true
        },
        salary: {
            type: String,
            default: "$80k - $120k / yr"
        },
        referralAvailable: {
            type: Boolean,
            default: true
        },
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        applicants: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                appliedAt: {
                    type: Date,
                    default: Date.now
                },
                resume: String,
                notes: String,
                status: {
                    type: String,
                    enum: ["pending", "reviewed", "shortlisted", "rejected"],
                    default: "pending"
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const MongooseJob = mongoose.models.Job || mongoose.model("Job", jobSchema);

const JobProxy = new Proxy(MongooseJob, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockJob) {
            return MockJob[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = JobProxy;
