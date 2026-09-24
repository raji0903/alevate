const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const studentRoutes = require("./routes/studentRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/students", studentRoutes);


// Start server
app.listen(PORT, () => {
    console.log(`Alevate server running on http://localhost:${PORT}`);
});