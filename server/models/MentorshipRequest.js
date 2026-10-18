
const mongoose = require("mongoose");
const { MockMentorshipRequest } = require("./mockStore");

const mentorshipRequestSchema = new mongoose.Schema(
    {
        // Supports MongoDB ObjectIds and demo string IDs.
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

        topic: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed"],
            default: "pending"
        },

        responseNote: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const MongooseMentorshipRequest =
    mongoose.models.MentorshipRequest ||
    mongoose.model("MentorshipRequest", mentorshipRequestSchema);

const MentorshipRequestProxy = new Proxy(
    MongooseMentorshipRequest,
    {
        get(target, prop, receiver) {
            if (
                mongoose.connection.readyState !== 1 &&
                prop in MockMentorshipRequest
            ) {
                return MockMentorshipRequest[prop];
            }

            const value = Reflect.get(target, prop, receiver);

            return typeof value === "function"
                ? value.bind(target)
                : value;
        }
    }
);

module.exports = MentorshipRequestProxy;
