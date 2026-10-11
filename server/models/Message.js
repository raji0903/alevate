const mongoose = require("mongoose");
const { MockMessage } = require("./mockStore");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true
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

const MongooseMessage = mongoose.models.Message || mongoose.model("Message", messageSchema);

const MessageProxy = new Proxy(MongooseMessage, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockMessage) {
            return MockMessage[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = MessageProxy;
