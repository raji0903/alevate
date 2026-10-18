
const mongoose = require("mongoose");
const { MockNotification } = require("./mockStore");

const notificationSchema = new mongoose.Schema(
    {
        // Supports MongoDB ObjectIds and demo string IDs.
        recipient: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            ref: "User"
        },

        sender: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
            ref: "User"
        },

        type: {
            type: String,
            enum: [
                "mentorship_request",
                "mentorship_accepted",
                "mentorship_rejected",
                "session_scheduled",
                "referral_request",
                "referral_status",
                "message",
                "system"
            ],
            default: "system"
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true
        },

        link: {
            type: String,
            default: ""
        },

        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const MongooseNotification =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);

const NotificationProxy = new Proxy(
    MongooseNotification,
    {
        get(target, prop, receiver) {
            if (
                mongoose.connection.readyState !== 1 &&
                prop in MockNotification
            ) {
                return MockNotification[prop];
            }

            const value = Reflect.get(target, prop, receiver);

            return typeof value === "function"
                ? value.bind(target)
                : value;
        }
    }
);

module.exports = NotificationProxy;
