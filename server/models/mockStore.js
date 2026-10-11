// Mock Store for in-memory resilience and initial fallback data
const bcrypt = require("bcryptjs");

const users = new Map();
const studentProfiles = new Map();
const alumniProfiles = new Map();
const jobs = new Map();
const mentorshipRequests = new Map();
const mentorshipSessions = new Map();
const referralRequests = new Map();
const conversations = new Map();
const messages = new Map();
const notifications = new Map();

function generateId(prefix = 'id') {
    return prefix + '_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Seed initial realistic data
(async () => {
    const hashedPw = await bcrypt.hash("password123", 10);

    // Seed Alumni 1: Google Staff Software Engineer
    const alumni1Id = "alumni_google_priya";
    users.set(alumni1Id, {
        _id: alumni1Id,
        id: alumni1Id,
        name: "Priya Sharma",
        email: "priya.sharma@google.com",
        password: hashedPw,
        role: "alumni",
        profileImage: "",
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 30 * 86400000)
    });
    alumniProfiles.set(alumni1Id, {
        _id: "ap_1",
        id: "ap_1",
        user: alumni1Id,
        company: "Google",
        jobTitle: "Senior Software Engineer",
        industry: "Cloud & Distributed Systems",
        experience: 6,
        skills: ["System Design", "Go", "Kubernetes", "Java", "DSA", "Distributed Systems"],
        expertise: ["Backend Architecture", "FAANG Interview Prep", "Resume Review"],
        availability: "Weekends & Evenings (5 slots/wk)",
        bio: "Alumni class of 2019. Passionate about helping ambitious students break into big tech and build scalable systems.",
        socialLinks: { linkedin: "https://linkedin.com/in/priyasharma", github: "https://github.com/priyasharma" },
        createdAt: new Date()
    });

    // Seed Alumni 2: Microsoft AI Research / Tech Lead
    const alumni2Id = "alumni_msft_marcus";
    users.set(alumni2Id, {
        _id: alumni2Id,
        id: alumni2Id,
        name: "Marcus Vance",
        email: "marcus.vance@microsoft.com",
        password: hashedPw,
        role: "alumni",
        profileImage: "",
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 25 * 86400000)
    });
    alumniProfiles.set(alumni2Id, {
        _id: "ap_2",
        id: "ap_2",
        user: alumni2Id,
        company: "Microsoft",
        jobTitle: "Principal Product Lead",
        industry: "AI & Azure Cloud",
        experience: 8,
        skills: ["Product Strategy", "AI/ML Solutions", "Career Growth", "Cloud Architecture", "Leadership"],
        expertise: ["Product Management", "Executive Mentorship", "Career Pivoting"],
        availability: "Flexible (3 slots/wk)",
        bio: "Former startup founder turned Microsoft product leader. Mentoring the next generation of product thinkers.",
        socialLinks: { linkedin: "https://linkedin.com/in/marcusvance", github: "https://github.com/marcusv" },
        createdAt: new Date()
    });

    // Seed Alumni 3: Stripe Full-Stack & Fintech Lead
    const alumni3Id = "alumni_stripe_aisha";
    users.set(alumni3Id, {
        _id: alumni3Id,
        id: alumni3Id,
        name: "Aisha Patel",
        email: "aisha.patel@stripe.com",
        password: hashedPw,
        role: "alumni",
        profileImage: "",
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 20 * 86400000)
    });
    alumniProfiles.set(alumni3Id, {
        _id: "ap_3",
        id: "ap_3",
        user: alumni3Id,
        company: "Stripe",
        jobTitle: "Staff Frontend Engineer",
        industry: "Fintech & Developer Tools",
        experience: 5,
        skills: ["React", "TypeScript", "Node.js", "GraphQL", "Web Performance", "UI Systems"],
        expertise: ["Frontend Mastery", "Open Source", "Design Systems"],
        availability: "Mon, Wed & Sat",
        bio: "Specializing in high-reliability financial interfaces. Happy to conduct mock coding interviews and portfolio reviews.",
        socialLinks: { linkedin: "https://linkedin.com/in/aishapatel", github: "https://github.com/aishapatel" },
        createdAt: new Date()
    });

    // Seed Alumni 4: Pending Admin Approval (Databricks Infrastructure Engineer)
    const alumni4Id = "alumni_databricks_devon";
    users.set(alumni4Id, {
        _id: alumni4Id,
        id: alumni4Id,
        name: "Devon Miller",
        email: "devon.miller@databricks.com",
        password: hashedPw,
        role: "alumni",
        profileImage: "",
        isVerified: false, // Pending admin approval
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 86400000)
    });
    alumniProfiles.set(alumni4Id, {
        _id: "ap_4",
        id: "ap_4",
        user: alumni4Id,
        company: "Databricks",
        jobTitle: "Senior Distributed Systems Engineer",
        industry: "Big Data & AI Infrastructure",
        experience: 5,
        skills: ["Apache Spark", "Kubernetes", "Go", "Distributed Storage", "C++", "Docker"],
        expertise: ["Data Engineering", "Distributed Systems", "Mock Interviews"],
        availability: "Tuesdays & Thursdays",
        bio: "5 years building high-throughput distributed database engines and data platforms at Databricks. Excited to mentor college students on systems programming.",
        socialLinks: { linkedin: "https://linkedin.com/in/devonmiller", github: "https://github.com/devonmiller" },
        createdAt: new Date()
    });

    // Seed Admin User
    const adminId = "admin_alevate_root";
    users.set(adminId, {
        _id: adminId,
        id: adminId,
        name: "Alevate Admin",
        email: "admin@alevate.edu",
        password: hashedPw,
        role: "admin",
        profileImage: "",
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 60 * 86400000)
    });

    // Seed Sample Student User
    const student1Id = "student_alex_rivera";
    users.set(student1Id, {
        _id: student1Id,
        id: student1Id,
        name: "Alex Rivera",
        email: "alex@university.edu",
        password: hashedPw,
        role: "student",
        profileImage: "",
        isVerified: true,
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 86400000)
    });
    studentProfiles.set(student1Id, {
        _id: "sp_1",
        id: "sp_1",
        user: student1Id,
        college: "School of Engineering & Computer Science",
        department: "Computer Science",
        graduationYear: 2026,
        bio: "Junior CS student keen on full-stack web engineering, distributed systems, and distributed AI algorithms.",
        skills: ["React", "TypeScript", "Node.js", "Python", "DSA", "SQL"],
        interests: ["Cloud Infrastructure", "Full Stack Development", "System Design"],
        careerGoals: ["Software Engineer at top tech company", "Build impactful open source tools"],
        resume: "https://alevate.storage/resumes/alex_rivera_cv.pdf",
        socialLinks: { linkedin: "https://linkedin.com/in/alexrivera", github: "https://github.com/alexrivera" },
        createdAt: new Date()
    });

    // Seed Jobs
    const job1Id = "job_google_swe";
    jobs.set(job1Id, {
        _id: job1Id,
        id: job1Id,
        title: "Software Engineering Intern (Summer 2027)",
        company: "Google",
        location: "Mountain View, CA (Hybrid)",
        type: "Internship",
        industry: "Technology",
        experienceLevel: "Internship",
        skillsRequired: ["Java", "C++", "Python", "DSA", "Data Structures", "Algorithms"],
        description: "Join Google engineering teams to work on critical infrastructure, core search, cloud computing, and machine learning platforms.",
        salary: "$52 - $58 / hour",
        referralAvailable: true,
        postedBy: alumni1Id,
        applicants: [],
        createdAt: new Date(Date.now() - 5 * 86400000)
    });

    const job2Id = "job_stripe_swe";
    jobs.set(job2Id, {
        _id: job2Id,
        id: job2Id,
        title: "Frontend Engineer — Core Dashboard",
        company: "Stripe",
        location: "San Francisco, CA or Remote",
        type: "Full-time",
        industry: "Fintech",
        experienceLevel: "Entry-level / New Grad",
        skillsRequired: ["React", "TypeScript", "Node.js", "CSS", "UI Systems"],
        description: "Help build the economic infrastructure for the internet. You will craft pixel-perfect, accessible, and ultra-performant interfaces used by millions of merchants worldwide.",
        salary: "$145,000 - $175,000 + Equity",
        referralAvailable: true,
        postedBy: alumni3Id,
        applicants: [],
        createdAt: new Date(Date.now() - 3 * 86400000)
    });

    const job3Id = "job_msft_pm";
    jobs.set(job3Id, {
        _id: job3Id,
        id: job3Id,
        title: "Associate Product Manager (APM)",
        company: "Microsoft",
        location: "Redmond, WA",
        type: "Full-time",
        industry: "Cloud & AI",
        experienceLevel: "New Grad",
        skillsRequired: ["Product Strategy", "Data Analysis", "Agile", "Communication", "System Design"],
        description: "Lead product initiatives across Azure AI and Copilot experiences. Collaborate with engineering, design, and enterprise clients.",
        salary: "$130,000 - $155,000 + Bonus",
        referralAvailable: true,
        postedBy: alumni2Id,
        applicants: [],
        createdAt: new Date(Date.now() - 7 * 86400000)
    });

    const job4Id = "job_databricks_ml";
    jobs.set(job4Id, {
        _id: job4Id,
        id: job4Id,
        title: "Systems Software Engineer — Lakehouse",
        company: "Databricks",
        location: "San Francisco, CA",
        type: "Full-time",
        industry: "Big Data & AI",
        experienceLevel: "Entry-level",
        skillsRequired: ["Go", "C++", "Distributed Systems", "SQL", "Kubernetes"],
        description: "Work on world-class unified analytics platforms powering real-time AI and big data processing.",
        salary: "$150,000 - $185,000",
        referralAvailable: true,
        postedBy: alumni1Id,
        applicants: [],
        createdAt: new Date(Date.now() - 2 * 86400000)
    });

    // Seed Mentorship Requests & Sessions
    const mr1Id = "mr_1";
    mentorshipRequests.set(mr1Id, {
        _id: mr1Id,
        id: mr1Id,
        student: student1Id,
        alumni: alumni1Id,
        topic: "FAANG Distributed Systems & Coding Prep",
        message: "Hi Priya! I've been studying system design and wanted to get your advice on tailoring my background for Google summer internship applications.",
        status: "accepted",
        createdAt: new Date(Date.now() - 4 * 86400000)
    });

    const ms1Id = "ms_1";
    mentorshipSessions.set(ms1Id, {
        _id: ms1Id,
        id: ms1Id,
        student: student1Id,
        alumni: alumni1Id,
        title: "System Design & Google SWE Interview Strategy",
        date: "Tomorrow",
        time: "5:00 PM EST",
        durationMinutes: 45,
        meetingLink: "https://meet.google.com/alevate-priya-alex",
        status: "scheduled",
        notes: "Prepare questions on distributed caching and load balancers.",
        createdAt: new Date(Date.now() - 2 * 86400000)
    });

    const ms2Id = "ms_2";
    mentorshipSessions.set(ms2Id, {
        _id: ms2Id,
        id: ms2Id,
        student: student1Id,
        alumni: alumni3Id,
        title: "Frontend Portfolio & Resume Deep-Dive",
        date: "Friday, Oct 3",
        time: "3:30 PM EST",
        durationMinutes: 30,
        meetingLink: "https://meet.google.com/alevate-aisha-alex",
        status: "scheduled",
        notes: "Review Alex's GitHub open-source contributions and React design system.",
        createdAt: new Date(Date.now() - 1 * 86400000)
    });

    // Seed Referral Request
    const ref1Id = "ref_1";
    referralRequests.set(ref1Id, {
        _id: ref1Id,
        id: ref1Id,
        student: student1Id,
        alumni: alumni1Id,
        job: job1Id,
        notes: "I have completed three distributed system projects and solved 200+ LeetCode problems. Would greatly appreciate a referral to Google.",
        resumeUrl: "https://alevate.storage/resumes/alex_rivera_cv.pdf",
        status: "accepted",
        feedback: "Submitted your profile to Google Internal Referral Portal! Good luck!",
        createdAt: new Date(Date.now() - 2 * 86400000)
    });

    // Seed Notifications
    const notif1 = "notif_1";
    notifications.set(notif1, {
        _id: notif1,
        id: notif1,
        recipient: student1Id,
        sender: alumni1Id,
        type: "session_scheduled",
        title: "Session Confirmed",
        message: "Priya Sharma confirmed your session: 'System Design & Google SWE Strategy'",
        link: "/sessions",
        read: false,
        createdAt: new Date(Date.now() - 2 * 3600000)
    });
})();

// Helper query runner
function matchesQuery(item, query) {
    if (!query) return true;
    for (const [key, val] of Object.entries(query)) {
        if (key === '$or' && Array.isArray(val)) {
            const orMatch = val.some(subQuery => matchesQuery(item, subQuery));
            if (!orMatch) return false;
            continue;
        }
        if (item[key] === undefined) return false;
        if (typeof val === 'string' && typeof item[key] === 'string') {
            if (item[key].toLowerCase() !== val.toLowerCase()) return false;
        } else if (item[key]?.toString() !== val?.toString()) {
            return false;
        }
    }
    return true;
}

// Mock User
const MockUser = {
    async find(query = {}) {
        return Array.from(users.values()).filter(u => matchesQuery(u, query)).map(u => ({ ...u }));
    },
    async findOne(query) {
        if (!query) return null;
        for (const user of users.values()) {
            let match = true;
            if (query.email && user.email.toLowerCase() !== query.email.toLowerCase()) match = false;
            if (query._id && user._id !== query._id && user.id !== query._id) match = false;
            if (query.role && user.role !== query.role) match = false;
            if (match) return { ...user };
        }
        return null;
    },
    async findById(id) {
        return users.get(id?.toString()) ? { ...users.get(id?.toString()) } : null;
    },
    async countDocuments(query = {}) {
        return Array.from(users.values()).filter(u => matchesQuery(u, query)).length;
    },
    async findByIdAndUpdate(id, update, options = {}) {
        const u = users.get(id?.toString());
        if (!u) return null;
        Object.assign(u, update.$set || update);
        u.updatedAt = new Date();
        users.set(u._id, u);
        return { ...u };
    },
    async create(data) {
        const _id = generateId("usr");
        const user = {
            _id,
            id: _id,
            name: data.name,
            email: data.email.toLowerCase(),
            password: data.password,
            role: data.role || "student",
            profileImage: "",
            isVerified: data.role === "student" ? true : false,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        users.set(_id, user);
        return { ...user };
    }
};

// Mock StudentProfile
const MockStudentProfile = {
    async find(query = {}) {
        const list = Array.from(studentProfiles.values()).filter(p => matchesQuery(p, query));
        return list.map(p => {
            const cloned = { ...p };
            const u = users.get(cloned.user?.toString());
            if (u) cloned.user = { _id: u._id, name: u.name, email: u.email, role: u.role, profileImage: u.profileImage };
            return cloned;
        });
    },
    findOne(query) {
        const exec = async () => {
            if (!query) return null;
            for (const profile of studentProfiles.values()) {
                if (query.user && profile.user?.toString() === query.user?.toString()) {
                    const cloned = { ...profile };
                    cloned.save = async function() {
                        cloned.updatedAt = new Date();
                        studentProfiles.set(cloned._id, cloned);
                        return cloned;
                    };
                    return cloned;
                }
            }
            return null;
        };

        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            populate(field) {
                return {
                    async then(resolve, reject) {
                        try {
                            const doc = await exec();
                            if (doc && field.includes("user")) {
                                const u = users.get(doc.user?.toString());
                                if (u) doc.user = { _id: u._id, name: u.name, email: u.email, role: u.role, profileImage: u.profileImage };
                            }
                            resolve(doc);
                        } catch (err) { reject(err); }
                    }
                };
            }
        };
    },
    async create(data) {
        const _id = generateId("sp");
        const profile = {
            _id,
            id: _id,
            user: data.user,
            college: data.college || "",
            department: data.department || "",
            graduationYear: data.graduationYear || 2026,
            bio: data.bio || "",
            skills: data.skills || [],
            interests: data.interests || [],
            careerGoals: data.careerGoals || [],
            resume: data.resume || "",
            socialLinks: data.socialLinks || { linkedin: "", github: "" },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        profile.save = async function() {
            profile.updatedAt = new Date();
            studentProfiles.set(_id, profile);
            return profile;
        };
        studentProfiles.set(_id, profile);
        return profile;
    }
};

// Mock AlumniProfile
const MockAlumniProfile = {
    find(query = {}) {
        const exec = async () => {
            const list = Array.from(alumniProfiles.values());
            return list.map(p => {
                const cloned = { ...p };
                const u = users.get(cloned.user?.toString());
                if (u) cloned.user = { _id: u._id, name: u.name, email: u.email, role: u.role, profileImage: u.profileImage, isVerified: u.isVerified };
                return cloned;
            });
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            populate() { return this; }
        };
    },
    findOne(query) {
        const exec = async () => {
            if (!query) return null;
            for (const profile of alumniProfiles.values()) {
                if (query.user && profile.user?.toString() === query.user?.toString()) {
                    const cloned = { ...profile };
                    cloned.save = async function() {
                        cloned.updatedAt = new Date();
                        alumniProfiles.set(cloned._id, cloned);
                        return cloned;
                    };
                    return cloned;
                }
            }
            return null;
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            populate(field) {
                return {
                    async then(resolve, reject) {
                        try {
                            const doc = await exec();
                            if (doc && field.includes("user")) {
                                const u = users.get(doc.user?.toString());
                                if (u) doc.user = { _id: u._id, name: u.name, email: u.email, role: u.role, profileImage: u.profileImage, isVerified: u.isVerified };
                            }
                            resolve(doc);
                        } catch (err) { reject(err); }
                    }
                };
            }
        };
    },
    async create(data) {
        const _id = generateId("ap");
        const profile = {
            _id,
            id: _id,
            user: data.user,
            company: data.company || "",
            jobTitle: data.jobTitle || "",
            industry: data.industry || "",
            experience: data.experience || 0,
            skills: data.skills || [],
            expertise: data.expertise || [],
            availability: data.availability || "",
            bio: data.bio || "",
            socialLinks: data.socialLinks || { linkedin: "", github: "" },
            createdAt: new Date(),
            updatedAt: new Date()
        };
        profile.save = async function() {
            profile.updatedAt = new Date();
            alumniProfiles.set(_id, profile);
            return profile;
        };
        alumniProfiles.set(_id, profile);
        return profile;
    }
};

// Mock Job
const MockJob = {
    find(query = {}) {
        const exec = async () => {
            const list = Array.from(jobs.values()).map(j => {
                const cloned = { ...j };
                const poster = users.get(cloned.postedBy?.toString());
                if (poster) cloned.postedBy = { _id: poster._id, name: poster.name, email: poster.email };
                return cloned;
            });
            return list;
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            sort() { return this; },
            populate() { return this; }
        };
    },
    async findById(id) {
        const j = jobs.get(id?.toString());
        if (!j) return null;
        const cloned = { ...j };
        const poster = users.get(cloned.postedBy?.toString());
        if (poster) cloned.postedBy = { _id: poster._id, name: poster.name, email: poster.email };
        return cloned;
    },
    async countDocuments() {
        return jobs.size;
    },
    async create(data) {
        const _id = generateId("job");
        const job = {
            _id,
            id: _id,
            title: data.title,
            company: data.company,
            location: data.location || "Remote",
            type: data.type || "Full-time",
            industry: data.industry || "Technology",
            experienceLevel: data.experienceLevel || "Entry-level",
            skillsRequired: data.skillsRequired || [],
            description: data.description,
            salary: data.salary || "Competitive",
            referralAvailable: data.referralAvailable !== undefined ? data.referralAvailable : true,
            postedBy: data.postedBy,
            applicants: [],
            createdAt: new Date()
        };
        jobs.set(_id, job);
        return job;
    },
    async findByIdAndUpdate(id, update) {
        const j = jobs.get(id?.toString());
        if (!j) return null;
        if (update.$push && update.$push.applicants) {
            j.applicants.push(update.$push.applicants);
        } else {
            Object.assign(j, update);
        }
        jobs.set(j._id, j);
        return j;
    }
};

// Mock MentorshipRequest
const MockMentorshipRequest = {
    find(query = {}) {
        const exec = async () => {
            return Array.from(mentorshipRequests.values()).filter(r => matchesQuery(r, query)).map(r => {
                const cloned = { ...r };
                const stu = users.get(cloned.student?.toString());
                if (stu) cloned.student = { _id: stu._id, name: stu.name, email: stu.email, profileImage: stu.profileImage };
                const alm = users.get(cloned.alumni?.toString());
                if (alm) cloned.alumni = { _id: alm._id, name: alm.name, email: alm.email, profileImage: alm.profileImage };
                return cloned;
            });
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            sort() { return this; },
            populate() { return this; }
        };
    },
    async findById(id) {
        const r = mentorshipRequests.get(id?.toString());
        if (!r) return null;
        const cloned = { ...r };
        const stu = users.get(cloned.student?.toString());
        if (stu) cloned.student = { _id: stu._id, name: stu.name, email: stu.email, profileImage: stu.profileImage };
        const alm = users.get(cloned.alumni?.toString());
        if (alm) cloned.alumni = { _id: alm._id, name: alm.name, email: alm.email, profileImage: alm.profileImage };
        return cloned;
    },
    async create(data) {
        const _id = generateId("mr");
        const req = {
            _id,
            id: _id,
            student: data.student,
            alumni: data.alumni,
            topic: data.topic,
            message: data.message,
            status: "pending",
            createdAt: new Date()
        };
        mentorshipRequests.set(_id, req);
        return req;
    },
    async findByIdAndUpdate(id, update) {
        const r = mentorshipRequests.get(id?.toString());
        if (!r) return null;
        Object.assign(r, update);
        mentorshipRequests.set(r._id, r);
        return r;
    }
};

// Mock MentorshipSession
const MockMentorshipSession = {
    find(query = {}) {
        const exec = async () => {
            return Array.from(mentorshipSessions.values()).filter(s => matchesQuery(s, query)).map(s => {
                const cloned = { ...s };
                const stu = users.get(cloned.student?.toString());
                if (stu) cloned.student = { _id: stu._id, name: stu.name, email: stu.email, profileImage: stu.profileImage };
                const alm = users.get(cloned.alumni?.toString());
                if (alm) cloned.alumni = { _id: alm._id, name: alm.name, email: alm.email, profileImage: alm.profileImage };
                return cloned;
            });
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            sort() { return this; },
            populate() { return this; }
        };
    },
    async countDocuments() {
        return mentorshipSessions.size;
    },
    async create(data) {
        const _id = generateId("ms");
        const sess = {
            _id,
            id: _id,
            student: data.student,
            alumni: data.alumni,
            title: data.title,
            date: data.date,
            time: data.time,
            durationMinutes: data.durationMinutes || 45,
            meetingLink: data.meetingLink || "https://meet.google.com/alevate-session",
            status: "scheduled",
            notes: data.notes || "",
            createdAt: new Date()
        };
        mentorshipSessions.set(_id, sess);
        return sess;
    },
    async findByIdAndUpdate(id, update) {
        const s = mentorshipSessions.get(id?.toString());
        if (!s) return null;
        Object.assign(s, update);
        mentorshipSessions.set(s._id, s);
        return s;
    }
};

// Mock ReferralRequest
const MockReferralRequest = {
    find(query = {}) {
        const exec = async () => {
            return Array.from(referralRequests.values()).filter(r => matchesQuery(r, query)).map(r => {
                const cloned = { ...r };
                const stu = users.get(cloned.student?.toString());
                if (stu) cloned.student = { _id: stu._id, name: stu.name, email: stu.email, profileImage: stu.profileImage };
                const alm = users.get(cloned.alumni?.toString());
                if (alm) cloned.alumni = { _id: alm._id, name: alm.name, email: alm.email, profileImage: alm.profileImage };
                const j = jobs.get(cloned.job?.toString());
                if (j) cloned.job = { _id: j._id, title: j.title, company: j.company, location: j.location };
                return cloned;
            });
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            sort() { return this; },
            populate() { return this; }
        };
    },
    async create(data) {
        const _id = generateId("ref");
        const req = {
            _id,
            id: _id,
            student: data.student,
            alumni: data.alumni,
            job: data.job,
            notes: data.notes,
            resumeUrl: data.resumeUrl || "",
            status: "pending",
            feedback: "",
            createdAt: new Date()
        };
        referralRequests.set(_id, req);
        return req;
    },
    async findByIdAndUpdate(id, update) {
        const r = referralRequests.get(id?.toString());
        if (!r) return null;
        Object.assign(r, update);
        referralRequests.set(r._id, r);
        return r;
    }
};

// Mock Conversation & Messages
const MockConversation = {
    find(query = {}) {
        const exec = async () => {
            return Array.from(conversations.values()).filter(c => {
                if (query.participants && query.participants.$in) {
                    const target = query.participants.$in[0]?.toString();
                    return c.participants.some(p => p?.toString() === target);
                }
                return true;
            }).map(c => {
                const cloned = { ...c };
                cloned.participants = cloned.participants.map(pid => {
                    const u = users.get(pid?.toString());
                    return u ? { _id: u._id, name: u.name, email: u.email, role: u.role, profileImage: u.profileImage } : pid;
                });
                return cloned;
            });
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            sort() { return this; },
            populate() { return this; }
        };
    },
    async findOne(query = {}) {
        for (const c of conversations.values()) {
            if (query.participants && query.participants.$all) {
                const [p1, p2] = query.participants.$all.map(x => x?.toString());
                const cp = c.participants.map(x => x?.toString());
                if (cp.includes(p1) && cp.includes(p2)) return { ...c };
            }
        }
        return null;
    },
    async findById(id) {
        const c = conversations.get(id?.toString());
        if (!c) return null;
        const cloned = { ...c };
        cloned.participants = cloned.participants.map(pid => {
            const u = users.get(pid?.toString());
            return u ? { _id: u._id, name: u.name, email: u.email, role: u.role, profileImage: u.profileImage } : pid;
        });
        return cloned;
    },
    async create(data) {
        const _id = generateId("conv");
        const conv = {
            _id,
            id: _id,
            participants: data.participants,
            lastMessage: data.lastMessage || "",
            lastMessageSender: data.lastMessageSender || null,
            lastMessageAt: new Date(),
            createdAt: new Date()
        };
        conversations.set(_id, conv);
        return conv;
    },
    async findByIdAndUpdate(id, update) {
        const c = conversations.get(id?.toString());
        if (!c) return null;
        Object.assign(c, update);
        conversations.set(c._id, c);
        return c;
    }
};

const MockMessage = {
    find(query = {}) {
        const exec = async () => {
            return Array.from(messages.values()).filter(m => matchesQuery(m, query)).map(m => {
                const cloned = { ...m };
                const s = users.get(cloned.sender?.toString());
                if (s) cloned.sender = { _id: s._id, name: s.name, profileImage: s.profileImage };
                return cloned;
            });
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            sort() { return this; },
            populate() { return this; }
        };
    },
    async create(data) {
        const _id = generateId("msg");
        const msg = {
            _id,
            id: _id,
            conversationId: data.conversationId,
            sender: data.sender,
            receiver: data.receiver,
            content: data.content,
            read: false,
            createdAt: new Date()
        };
        messages.set(_id, msg);
        // update conversation
        if (data.conversationId) {
            await MockConversation.findByIdAndUpdate(data.conversationId, {
                lastMessage: data.content,
                lastMessageSender: data.sender,
                lastMessageAt: new Date()
            });
        }
        return msg;
    }
};

const MockNotification = {
    find(query = {}) {
        const exec = async () => {
            return Array.from(notifications.values()).filter(n => matchesQuery(n, query)).map(n => ({ ...n }));
        };
        return {
            then(resolve, reject) { return exec().then(resolve, reject); },
            sort() { return this; }
        };
    },
    async create(data) {
        const _id = generateId("notif");
        const notif = {
            _id,
            id: _id,
            recipient: data.recipient,
            sender: data.sender || null,
            type: data.type || "system",
            title: data.title,
            message: data.message,
            link: data.link || "",
            read: false,
            createdAt: new Date()
        };
        notifications.set(_id, notif);
        return notif;
    },
    async updateMany(query, update) {
        for (const notif of notifications.values()) {
            if (matchesQuery(notif, query)) {
                Object.assign(notif, update);
            }
        }
        return { modifiedCount: notifications.size };
    }
};

module.exports = {
    MockUser,
    MockStudentProfile,
    MockAlumniProfile,
    MockJob,
    MockMentorshipRequest,
    MockMentorshipSession,
    MockReferralRequest,
    MockConversation,
    MockMessage,
    MockNotification
};
