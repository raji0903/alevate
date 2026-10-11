const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

// Get all conversations for current user
const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        let convs = await Conversation.find({
            participants: { $in: [userId] }
        }).sort({ lastMessageAt: -1 });

        res.json({ success: true, conversations: convs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch conversations", error: err.message });
    }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const msgs = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.json({ success: true, messages: msgs });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch messages", error: err.message });
    }
};

// Start or get conversation with user
const startConversation = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const currentUserId = req.user.userId;

        let conv = await Conversation.findOne({
            participants: { $all: [currentUserId, recipientId] }
        });

        if (!conv) {
            conv = await Conversation.create({
                participants: [currentUserId, recipientId],
                lastMessage: "Started a conversation",
                lastMessageSender: currentUserId
            });
        }

        // populate participants
        const fullConv = await Conversation.findById(conv._id);
        res.json({ success: true, conversation: fullConv || conv });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to start conversation", error: err.message });
    }
};

// Send message
const sendMessage = async (req, res) => {
    try {
        const { conversationId, receiverId, content } = req.body;
        const senderId = req.user.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "Message content cannot be empty" });
        }

        let convId = conversationId;
        if (!convId && receiverId) {
            let conv = await Conversation.findOne({
                participants: { $all: [senderId, receiverId] }
            });
            if (!conv) {
                conv = await Conversation.create({
                    participants: [senderId, receiverId]
                });
            }
            convId = conv._id;
        }

        const newMsg = await Message.create({
            conversationId: convId,
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        // Broadcast through global io if available
        if (req.app.get("io")) {
            req.app.get("io").to(`conv_${convId}`).emit("new_message", newMsg);
            req.app.get("io").to(`user_${receiverId}`).emit("direct_message", newMsg);
        }

        res.status(201).json({ success: true, message: newMsg });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to send message", error: err.message });
    }
};

module.exports = {
    getConversations,
    getMessages,
    startConversation,
    sendMessage
};
