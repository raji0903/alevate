
const mongoose = require("mongoose");
const { MockMessage } = require("./mockStore");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },

        receiver: {
            type: mongoose.Schema.Types.Mixed,
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
    { timestamps: true }
);

const MongooseMessage =
    mongoose.models.Message ||
    mongoose.model("Message", messageSchema);

const MessageProxy = new Proxy(MongooseMessage, {
    get(target, prop, receiver) {
        if (
            mongoose.connection.readyState !== 1 &&
            prop in MockMessage
        ) {
            return MockMessage[prop];
        }

        const value = Reflect.get(target, prop, receiver);

        return typeof value === "function"
            ? value.bind(target)
            : value;
    }
});

module.exports = MessageProxy;
