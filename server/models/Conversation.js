const mongoose = require("mongoose");
const { MockConversation } = require("./mockStore");

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            }
        ],
        lastMessage: String,
        lastMessageSender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const MongooseConversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);

const ConversationProxy = new Proxy(MongooseConversation, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockConversation) {
            return MockConversation[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = ConversationProxy;
