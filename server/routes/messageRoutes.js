const express = require("express");
const {
    getConversations,
    getMessages,
    startConversation,
    sendMessage
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.post("/conversations/start", protect, startConversation);
router.get("/conversations/:conversationId", protect, getMessages);
router.post("/", protect, sendMessage);

module.exports = router;
