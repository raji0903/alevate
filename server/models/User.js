const mongoose = require("mongoose");
const { MockUser } = require("./mockStore");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        googleId: {
            type: String,
            default: undefined
        },

        role: {
            type: String,
            enum: ["student", "alumni", "admin"],
            default: "student"
        },

        profileImage: {
            type: String,
            default: ""
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Allow multiple users without a Google ID,
// but enforce uniqueness when a Google ID exists.
userSchema.index(
    { googleId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            googleId: { $type: "string" }
        }
    }
);

const MongooseUser =
    mongoose.models.User ||
    mongoose.model("User", userSchema);

const UserProxy = new Proxy(MongooseUser, {
    get(target, prop, receiver) {
        if (
            mongoose.connection.readyState !== 1 &&
            prop in MockUser
        ) {
            return MockUser[prop];
        }

        const val = Reflect.get(
            target,
            prop,
            receiver
        );

        return typeof val === "function"
            ? val.bind(target)
            : val;
    }
});

module.exports = UserProxy;