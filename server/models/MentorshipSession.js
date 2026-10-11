const mongoose = require("mongoose");
const { MockMentorshipSession } = require("./mockStore");

const mentorshipSessionSchema = new mongoose.Schema(
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
        title: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        durationMinutes: {
            type: Number,
            default: 45
        },
        meetingLink: {
            type: String,
            default: "https://meet.google.com/alevate-session"
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled"
        },
        notes: String
    },
    {
        timestamps: true
    }
);

const MongooseMentorshipSession = mongoose.models.MentorshipSession || mongoose.model("MentorshipSession", mentorshipSessionSchema);

const MentorshipSessionProxy = new Proxy(MongooseMentorshipSession, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockMentorshipSession) {
            return MockMentorshipSession[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = MentorshipSessionProxy;
