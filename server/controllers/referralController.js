const ReferralRequest = require("../models/ReferralRequest");
const Notification = require("../models/Notification");

// Request referral (student)
const requestReferral = async (req, res) => {
    try {
        const { alumniId, jobId, notes, resumeUrl } = req.body;
        if (!alumniId || !jobId || !notes) {
            return res.status(400).json({ success: false, message: "Alumni, Job, and request notes are required" });
        }

        const request = await ReferralRequest.create({
            student: req.user.userId,
            alumni: alumniId,
            job: jobId,
            notes,
            resumeUrl: resumeUrl || ""
        });

        await Notification.create({
            recipient: alumniId,
            sender: req.user.userId,
            type: "referral_request",
            title: "New Job Referral Request",
            message: "A student requested a company referral from you.",
            link: "/referrals"
        });

        res.status(201).json({ success: true, message: "Referral request submitted successfully!", request });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to request referral", error: err.message });
    }
};

// Get student's referrals
const getStudentReferrals = async (req, res) => {
    try {
        const referrals = await ReferralRequest.find({ student: req.user.userId });
        res.json({ success: true, referrals });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch referrals", error: err.message });
    }
};

// Get alumni's received referrals
const getAlumniReferrals = async (req, res) => {
    try {
        const referrals = await ReferralRequest.find({ alumni: req.user.userId });
        res.json({ success: true, referrals });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch referrals", error: err.message });
    }
};

// Update referral status (Alumni)
const updateReferralStatus = async (req, res) => {
    try {
        const { status, feedback } = req.body;
        const request = await ReferralRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: "Referral request not found" });

        const updated = await ReferralRequest.findByIdAndUpdate(req.params.id, {
            status,
            feedback: feedback || ""
        });

        await Notification.create({
            recipient: request.student?._id || request.student,
            sender: req.user.userId,
            type: "referral_status",
            title: `Referral Request ${status.toUpperCase()}`,
            message: `Your referral request status has been updated to "${status}".`,
            link: "/referrals"
        });

        res.json({ success: true, message: `Referral marked as ${status}`, referral: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update referral", error: err.message });
    }
};

module.exports = {
    requestReferral,
    getStudentReferrals,
    getAlumniReferrals,
    updateReferralStatus
};
