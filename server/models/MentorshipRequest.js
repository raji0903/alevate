const mongoose = require("mongoose");
const { MockMentorshipRequest } = require("./mockStore");

const mentorshipRequestSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        alumni: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        topic: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed"],
            default: "pending"
        },
        responseNote: String
    },
    {
        timestamps: true
    }
);

const MongooseMentorshipRequest = mongoose.models.MentorshipRequest || mongoose.model("MentorshipRequest", mentorshipRequestSchema);

const MentorshipRequestProxy = new Proxy(MongooseMentorshipRequest, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockMentorshipRequest) {
            return MockMentorshipRequest[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = MentorshipRequestProxy;
