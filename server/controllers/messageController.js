
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getUserId = (user) =>
    String(user?.userId ?? user?.id ?? user?._id ?? "");

const getParticipants = (conversation) =>
    (conversation?.participants || []).map((participant) =>
        String(
            participant?._id ??
            participant?.id ??
            participant
        )
    );

const isParticipant = (conversation, userId) =>
    getParticipants(conversation).includes(String(userId));

const getConversations = async (req, res) => {
    try {
        const userId = getUserId(req.user);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        const conversations = await Conversation.find({
            participants: userId
        }).sort({ lastMessageAt: -1 });

        const visibleConversations = conversations.filter((conversation) =>
            isParticipant(conversation, userId)
        );

        return res.json({
            success: true,
            conversations: visibleConversations
        });
    } catch (error) {
        console.error("getConversations:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch conversations."
        });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = getUserId(req.user);
        const { conversationId } = req.params;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation ID."
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!isParticipant(conversation, userId)) {
            return res.status(403).json({
                success: false,
                message: "You cannot access this conversation."
            });
        }

        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({ createdAt: 1 });

        return res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("getMessages:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch messages."
        });
    }
};

const startConversation = async (req, res) => {
    try {
        const currentUserId = getUserId(req.user);
        const recipientId = String(req.body?.recipientId ?? "").trim();

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (!recipientId || recipientId === currentUserId) {
            return res.status(400).json({
                success: false,
                message: "A valid recipient is required."
            });
        }

        const participants = [currentUserId, recipientId];

        let conversation = await Conversation.findOne({
            participants: { $all: participants }
        });

        if (conversation) {
            const existingParticipants = getParticipants(conversation);

            if (
                existingParticipants.length !== 2 ||
                !participants.every((id) => existingParticipants.includes(id))
            ) {
                conversation = null;
            }
        }

        if (!conversation) {
            conversation = await Conversation.create({
                participants,
                lastMessage: "",
                lastMessageSender: null,
                lastMessageAt: new Date()
            });
        }

        return res.status(200).json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error("startConversation:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to start conversation.",
            error: error.message
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const senderId = getUserId(req.user);
        const { conversationId, receiverId, content } = req.body;

        if (!senderId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (typeof content !== "string" || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message content cannot be empty."
            });
        }

        if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: "A valid conversation ID is required."
            });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }

        if (!isParticipant(conversation, senderId)) {
            return res.status(403).json({
                success: false,
                message: "You cannot send messages in this conversation."
            });
        }

        const participants = getParticipants(conversation);
        const actualReceiverId = participants.find(
            (participantId) => participantId !== senderId
        );

        if (!actualReceiverId) {
            return res.status(400).json({
                success: false,
                message: "Conversation recipient not found."
            });
        }

        if (
            receiverId &&
            String(receiverId) !== actualReceiverId
        ) {
            return res.status(400).json({
                success: false,
                message: "Recipient does not match the conversation."
            });
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            receiver: actualReceiverId,
            content: content.trim()
        });

        conversation.lastMessage = content.trim();
        conversation.lastMessageSender = senderId;
        conversation.lastMessageAt = new Date();

        await conversation.save();

        const io = req.app.get("io");

        if (io) {
            io.to(`conv_${conversation._id}`).emit(
                "new_message",
                newMessage
            );

            io.to(`user_${actualReceiverId}`).emit(
                "direct_message",
                newMessage
            );
        }

        return res.status(201).json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        console.error("sendMessage:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to send message.",
            error: error.message
        });
    }
};

module.exports = {
    getConversations,
    getMessages,
    startConversation,
    sendMessage
};
