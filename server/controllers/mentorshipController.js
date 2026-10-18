
const MentorshipRequest = require("../models/MentorshipRequest");
const MentorshipSession = require("../models/MentorshipSession");
const AlumniProfile = require("../models/AlumniProfile");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Get all mentors
const getMentors = async (req, res) => {
    try {
        const {
            search,
            company,
            industry,
            experience
        } = req.query;

        const alumniList = await AlumniProfile.find().populate(
            "user",
            "name email profileImage isVerified"
        );

        let mentors = alumniList
            .map((profile) => {
                const mentor = profile.user;

                return {
                    id: mentor?._id || mentor?.id || mentor,
                    profileId: profile._id,
                    name: mentor?.name || "Alumni Mentor",
                    email: mentor?.email,
                    profileImage: mentor?.profileImage || "",
                    isVerified: mentor?.isVerified !== false,
                    company: profile.company || "",
                    jobTitle: profile.jobTitle || "",
                    industry: profile.industry || "",
                    experience: profile.experience || 0,
                    skills: profile.skills || [],
                    expertise: profile.expertise || [],
                    availability: profile.availability || "Available",
                    bio: profile.bio || "",
                    socialLinks: profile.socialLinks || {}
                };
            })
            .filter((mentor) => mentor.isVerified);

        if (search) {
            const term = search.toLowerCase();

            mentors = mentors.filter((mentor) =>
                [
                    mentor.name,
                    mentor.company,
                    mentor.jobTitle,
                    mentor.industry,
                    ...mentor.skills,
                    ...mentor.expertise
                ].some((value) =>
                    String(value || "").toLowerCase().includes(term)
                )
            );
        }

        if (company && company !== "All") {
            mentors = mentors.filter(
                (mentor) =>
                    mentor.company.toLowerCase() === company.toLowerCase()
            );
        }

        if (industry && industry !== "All") {
            mentors = mentors.filter((mentor) =>
                mentor.industry.toLowerCase().includes(industry.toLowerCase())
            );
        }

        if (experience && experience !== "All") {
            const minimum = Number.parseInt(experience, 10);

            if (!Number.isNaN(minimum)) {
                mentors = mentors.filter(
                    (mentor) => mentor.experience >= minimum
                );
            }
        }

        return res.json({
            success: true,
            count: mentors.length,
            mentors
        });
    } catch (error) {
        console.error("Get mentors error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch mentors",
            error: error.message
        });
    }
};

// Student submits a mentorship request
const requestMentorship = async (req, res) => {
    try {
        const { alumniId, topic, message } = req.body;

        const studentId = req.user?.userId;

        if (!studentId) {
            return res.status(401).json({
                success: false,
                message: "Student authentication is required."
            });
        }

        if (!alumniId || !topic?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Alumni ID, topic, and message are required."
            });
        }

        // Confirm the mentor exists.
        const mentor = await User.findById(alumniId);

        if (!mentor || mentor.role !== "alumni") {
            return res.status(404).json({
                success: false,
                message: "The selected alumni mentor was not found."
            });
        }

        if (mentor.isVerified === false) {
            return res.status(403).json({
                success: false,
                message: "This alumni account has not been approved."
            });
        }

        if (String(mentor._id || mentor.id) === String(studentId)) {
            return res.status(400).json({
                success: false,
                message: "You cannot request mentorship from your own account."
            });
        }

        // Save the request first.
        const request = await MentorshipRequest.create({
            student: studentId,
            alumni: alumniId,
            topic: topic.trim(),
            message: message.trim()
        });

        // Notifications are secondary: their failure should not hide
        // a request that has already been saved successfully.
        try {
            await Notification.create({
                recipient: alumniId,
                sender: studentId,
                type: "mentorship_request",
                title: "New Mentorship Request",
                message: `A student requested mentorship on: "${topic.trim()}"`,
                link: "/requests"
            });
        } catch (notificationError) {
            console.error(
                "Mentorship request saved, but notification failed:",
                notificationError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Mentorship request submitted successfully!",
            request
        });
    } catch (error) {
        console.error("Submit mentorship request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit request",
            error: error.message
        });
    }
};

// Get requests sent by a student
const getStudentRequests = async (req, res) => {
    try {
        const requests = await MentorshipRequest.find({
            student: req.user.userId
        });

        return res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Get student requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch student requests",
            error: error.message
        });
    }
};

// Get requests received by an alumnus
const getAlumniRequests = async (req, res) => {
    try {
        const requests = await MentorshipRequest.find({
            alumni: req.user.userId
        });

        return res.json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Get alumni requests error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch alumni requests",
            error: error.message
        });
    }
};

// Alumni accepts or rejects a request
const respondToRequest = async (req, res) => {
    try {
        const { status, responseNote } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be accepted or rejected."
            });
        }

        const request = await MentorshipRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: "Request not found"
            });
        }

        const requestAlumniId = request.alumni?._id || request.alumni;

        if (String(requestAlumniId) !== String(req.user.userId)) {
            return res.status(403).json({
                success: false,
                message: "You cannot respond to another alumnus's request."
            });
        }

        const updated = await MentorshipRequest.findByIdAndUpdate(
            req.params.id,
            {
                status,
                responseNote: responseNote || ""
            },
            { new: true }
        );

        try {
            const studentId = request.student?._id || request.student;

            await Notification.create({
                recipient: studentId,
                sender: req.user.userId,
                type:
                    status === "accepted"
                        ? "mentorship_accepted"
                        : "mentorship_rejected",
                title:
                    status === "accepted"
                        ? "Mentorship Request Accepted"
                        : "Mentorship Request Declined",
                message: `Your mentorship request regarding "${request.topic}" has been ${status}.`,
                link: "/sessions"
            });
        } catch (notificationError) {
            console.error(
                "Request updated, but notification failed:",
                notificationError
            );
        }

        return res.json({
            success: true,
            message: `Request ${status} successfully`,
            request: updated
        });
    } catch (error) {
        console.error("Respond to mentorship request error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update request",
            error: error.message
        });
    }
};

// Get mentorship sessions
const getSessions = async (req, res) => {
    try {
        const userId = req.user.userId;

        const query =
            req.user.role === "alumni"
                ? { alumni: userId }
                : { student: userId };

        const sessions = await MentorshipSession.find(query);

        return res.json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error("Get mentorship sessions error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch sessions",
            error: error.message
        });
    }
};

// Schedule a mentorship session
const scheduleSession = async (req, res) => {
    try {
        const {
            studentId,
            alumniId,
            title,
            date,
            time,
            durationMinutes,
            meetingLink,
            notes
        } = req.body;

        if (!studentId || !alumniId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "Student, alumni, date, and time are required."
            });
        }

        const session = await MentorshipSession.create({
            student: studentId,
            alumni: alumniId,
            title: title || "1-on-1 Mentorship & Career Guidance",
            date,
            time,
            durationMinutes: durationMinutes || 45,
            meetingLink:
                meetingLink || "https://meet.google.com/alevate-session",
            notes: notes || ""
        });

        const notifyTarget =
            req.user.role === "student" ? alumniId : studentId;

        try {
            await Notification.create({
                recipient: notifyTarget,
                sender: req.user.userId,
                type: "session_scheduled",
                title: "New Mentorship Session Scheduled",
                message: `Mentorship session "${session.title}" scheduled for ${date} at ${time}.`,
                link: "/sessions"
            });
        } catch (notificationError) {
            console.error(
                "Session saved, but notification failed:",
                notificationError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Mentorship session scheduled successfully!",
            session
        });
    } catch (error) {
        console.error("Schedule mentorship session error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to schedule session",
            error: error.message
        });
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
