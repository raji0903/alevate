const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config(); // Load API keys before importing controllers that initialize SDK clients.
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const studentRoutes = require("./routes/studentRoutes");
const alumniRoutes = require("./routes/alumniRoutes");
const jobRoutes = require("./routes/jobRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const referralRoutes = require("./routes/referralRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

// Socket.io initialization for real-time messaging
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

io.on("connection", (socket) => {
    socket.on("join_user", (userId) => {
        if (userId) socket.join(`user_${userId}`);
    });

    socket.on("join_conversation", (conversationId) => {
        if (conversationId) socket.join(`conv_${conversationId}`);
    });

    socket.on("send_message", (messageData) => {
        if (messageData && messageData.conversationId) {
            io.to(`conv_${messageData.conversationId}`).emit("new_message", messageData);
            if (messageData.receiver) {
                io.to(`user_${messageData.receiver}`).emit("direct_message", messageData);
            }
        }
    });

    socket.on("disconnect", () => {
        // user disconnected
    });
});

// Port configuration: AI Studio strictly requires port 3000
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// Static assets for React Vite frontend
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

// SPA fallback for React Router
app.get("*", (req, res, next) => {
    // If request starts with /api, pass to 404
    if (req.path.startsWith("/api/")) {
        return res.status(404).json({ success: false, message: "API endpoint not found" });
    }
    const indexPath = path.join(distPath, "index.html");
    res.sendFile(indexPath, (err) => {
        if (err) {
            // Dist not yet compiled or building - send friendly fallback
            res.status(200).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ALEVATE</title>
                    <meta http-equiv="refresh" content="3">
                    <style>
                        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white; }
                    </style>
                </head>
                <body>
                    <div style="text-align: center;">
                        <h2 style="color: #38bdf8;">ALEVATE is starting up...</h2>
                        <p style="color: #94a3b8;">Frontend compilation in progress. Reloading automatically in 3 seconds.</p>
                    </div>
                </body>
                </html>
            `);
        }
    });
});

// Express error middleware
app.use((err, req, res, next) => {
    if (
        err.name === 'MongooseError' ||
        err.name === 'MongoNetworkError' ||
        (err.message && err.message.includes('buffering timed out'))
    ) {
        console.warn('[AI Studio] Database offline — returning fallback');
        if (req.method === 'GET') {
            return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
        }
        return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
    }
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Start server
server.listen(PORT, HOST, () => {
    console.log(`🚀 ALEVATE server running on http://localhost:${PORT}`);
});
