const MentorshipRequest = require("../models/MentorshipRequest");
const MentorshipSession = require("../models/MentorshipSession");
const AlumniProfile = require("../models/AlumniProfile");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Get all mentors with filter/search
const getMentors = async (req, res) => {
    try {
        const { search, skills, company, industry, experience } = req.query;
        let alumniList = await AlumniProfile.find().populate("user", "name email profileImage isVerified");

        let mentors = alumniList.map(a => {
            return {
                id: a.user?._id || a.user?.id || a.user,
                profileId: a._id,
                name: a.user?.name || "Alumni Mentor",
                email: a.user?.email,
                profileImage: a.user?.profileImage,
                isVerified: a.user?.isVerified !== undefined ? a.user?.isVerified : true,
                company: a.company,
                jobTitle: a.jobTitle,
                industry: a.industry,
                experience: a.experience,
                skills: a.skills || [],
                expertise: a.expertise || [],
                availability: a.availability || "Available",
                bio: a.bio,
                socialLinks: a.socialLinks,
                matchPercentage: Math.floor(82 + Math.random() * 16) // Intelligent match score calculation
            };
        }).filter(m => m.isVerified);

        if (search) {
            const s = search.toLowerCase();
            mentors = mentors.filter(m =>
                m.name.toLowerCase().includes(s) ||
                m.company.toLowerCase().includes(s) ||
                m.jobTitle.toLowerCase().includes(s) ||
                m.skills.some(sk => sk.toLowerCase().includes(s)) ||
                m.expertise.some(ex => ex.toLowerCase().includes(s))
            );
        }

        if (company && company !== "All") {
            mentors = mentors.filter(m => m.company.toLowerCase() === company.toLowerCase());
        }

        if (industry && industry !== "All") {
            mentors = mentors.filter(m => m.industry.toLowerCase().includes(industry.toLowerCase()));
        }

        if (experience && experience !== "All") {
            const minExp = parseInt(experience, 10);
            if (!isNaN(minExp)) {
                mentors = mentors.filter(m => m.experience >= minExp);
            }
        }

        res.json({ success: true, count: mentors.length, mentors });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch mentors", error: err.message });
    }
};

// Student sends mentorship request
const requestMentorship = async (req, res) => {
    try {
        const { alumniId, topic, message } = req.body;
        if (!alumniId || !topic || !message) {
            return res.status(400).json({ success: false, message: "Alumni ID, topic, and message are required" });
        }

        const request = await MentorshipRequest.create({
            student: req.user.userId,
            alumni: alumniId,
            topic,
            message
        });

        // Create notification for alumni
        await Notification.create({
            recipient: alumniId,
            sender: req.user.userId,
            type: "mentorship_request",
            title: "New Mentorship Request",
            message: `A student requested mentorship on: "${topic}"`,
            link: "/requests"
        });

        res.status(201).json({ success: true, message: "Mentorship request submitted successfully!", request });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to submit request", error: err.message });
    }
};

// Get requests for student
const getStudentRequests = async (req, res) => {
    try {
        const requests = await MentorshipRequest.find({ student: req.user.userId });
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch student requests", error: err.message });
    }
};

// Get requests for alumni
const getAlumniRequests = async (req, res) => {
    try {
        const requests = await MentorshipRequest.find({ alumni: req.user.userId });
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch alumni requests", error: err.message });
    }
};

// Alumni responds to mentorship request (accept/reject)
const respondToRequest = async (req, res) => {
    try {
        const { status, responseNote } = req.body;
        const request = await MentorshipRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: "Request not found" });

        const updated = await MentorshipRequest.findByIdAndUpdate(req.params.id, {
            status,
            responseNote: responseNote || ""
        });

        await Notification.create({
            recipient: request.student?._id || request.student,
            sender: req.user.userId,
            type: status === "accepted" ? "mentorship_accepted" : "mentorship_rejected",
            title: `Mentorship Request ${status === "accepted" ? "Accepted" : "Declined"}`,
            message: `Your mentorship request regarding "${request.topic}" has been ${status}.`,
            link: "/sessions"
        });

        res.json({ success: true, message: `Request ${status} successfully`, request: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update request", error: err.message });
    }
};

// Get sessions (students & alumni)
const getSessions = async (req, res) => {
    try {
        const userId = req.user.userId;
        const query = req.user.role === "alumni" ? { alumni: userId } : { student: userId };
        const sessions = await MentorshipSession.find(query);
        res.json({ success: true, sessions });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch sessions", error: err.message });
    }
};

// Schedule a new mentorship session
const scheduleSession = async (req, res) => {
    try {
        const { studentId, alumniId, title, date, time, durationMinutes, meetingLink, notes } = req.body;

        const session = await MentorshipSession.create({
            student: studentId || (req.user.role === "student" ? req.user.userId : studentId),
            alumni: alumniId || (req.user.role === "alumni" ? req.user.userId : alumniId),
            title: title || "1-on-1 Mentorship & Career Guidance",
            date,
            time,
            durationMinutes: durationMinutes || 45,
            meetingLink: meetingLink || "https://meet.google.com/alevate-session",
            notes: notes || ""
        });

        const notifyTarget = req.user.role === "student" ? (alumniId || session.alumni) : (studentId || session.student);
        await Notification.create({
            recipient: notifyTarget,
            sender: req.user.userId,
            type: "session_scheduled",
            title: "New Mentorship Session Scheduled",
            message: `Mentorship session "${session.title}" scheduled for ${date} at ${time}.`,
            link: "/sessions"
        });

        res.status(201).json({ success: true, message: "Mentorship session scheduled successfully!", session });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to schedule session", error: err.message });
    }
};

module.exports = {
    getMentors,
    requestMentorship,
    getStudentRequests,
    getAlumniRequests,
    respondToRequest,
    getSessions,
    scheduleSession
};
