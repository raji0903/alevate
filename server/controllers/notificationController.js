const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
    try {
        const notifs = await Notification.find({ recipient: req.user.userId }).sort({ createdAt: -1 });
        res.json({ success: true, notifications: notifs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch notifications", error: err.message });
    }
};

const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.userId }, { read: true });
        res.json({ success: true, message: "Notifications marked as read" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update notifications", error: err.message });
    }
};

module.exports = {
    getNotifications,
    markAllRead
};
