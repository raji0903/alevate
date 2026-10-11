const mongoose = require("mongoose");
const { MockNotification } = require("./mockStore");

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        type: {
            type: String,
            enum: ["mentorship_request", "mentorship_accepted", "mentorship_rejected", "session_scheduled", "referral_request", "referral_status", "message", "system"],
            default: "system"
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        link: String,
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const MongooseNotification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

const NotificationProxy = new Proxy(MongooseNotification, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockNotification) {
            return MockNotification[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = NotificationProxy;
