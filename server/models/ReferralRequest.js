const mongoose = require("mongoose");
const { MockReferralRequest } = require("./mockStore");

const referralRequestSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        alumni: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true
        },
        notes: {
            type: String,
            required: true
        },
        resumeUrl: String,
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed"],
            default: "pending"
        },
        feedback: String
    },
    {
        timestamps: true
    }
);

const MongooseReferralRequest = mongoose.models.ReferralRequest || mongoose.model("ReferralRequest", referralRequestSchema);

const ReferralRequestProxy = new Proxy(MongooseReferralRequest, {
    get(target, prop, receiver) {
        if (mongoose.connection.readyState !== 1 && prop in MockReferralRequest) {
            return MockReferralRequest[prop];
        }
        const val = Reflect.get(target, prop, receiver);
        return typeof val === "function" ? val.bind(target) : val;
    }
});

module.exports = ReferralRequestProxy;
