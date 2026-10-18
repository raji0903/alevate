
const mongoose = require("mongoose");
const { MockMentorshipSession } = require("./mockStore");

const mentorshipSessionSchema = new mongoose.Schema(
    {
        // Supports both MongoDB IDs and demo string IDs.
        student: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            ref: "User"
        },

        alumni: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            ref: "User"
        },

        title: {
            type: String,
            required: true,
            trim: true
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

        notes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const MongooseMentorshipSession =
    mongoose.models.MentorshipSession ||
    mongoose.model("MentorshipSession", mentorshipSessionSchema);

const MentorshipSessionProxy = new Proxy(
    MongooseMentorshipSession,
    {
        get(target, prop, receiver) {
            if (
                mongoose.connection.readyState !== 1 &&
                prop in MockMentorshipSession
            ) {
                return MockMentorshipSession[prop];
            }

            const value = Reflect.get(target, prop, receiver);

            return typeof value === "function"
                ? value.bind(target)
                : value;
        }
    }
);

module.exports = MentorshipSessionProxy;
