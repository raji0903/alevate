
const mongoose = require("mongoose");
const { MockConversation } = require("./mockStore");

const conversationSchema = new mongoose.Schema(
    {
        participants: {
            type: [mongoose.Schema.Types.Mixed],
            required: true,
            validate: {
                validator: function (participants) {
                    return Array.isArray(participants) &&
                        participants.length >= 2;
                },
                message: "A conversation must have at least two participants."
            }
        },

        lastMessage: {
            type: String,
            default: ""
        },

        lastMessageSender: {
            type: mongoose.Schema.Types.Mixed,
            default: null
        },

        lastMessageAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

const MongooseConversation =
    mongoose.models.Conversation ||
    mongoose.model("Conversation", conversationSchema);

const ConversationProxy = new Proxy(MongooseConversation, {
    get(target, prop, receiver) {
        if (
            mongoose.connection.readyState !== 1 &&
            prop in MockConversation
        ) {
            return MockConversation[prop];
        }

        const value = Reflect.get(target, prop, receiver);

        return typeof value === "function"
            ? value.bind(target)
            : value;
    }
});

module.exports = ConversationProxy;
