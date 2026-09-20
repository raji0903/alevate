const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");

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

// Start server
app.listen(PORT, () => {
    console.log(`Alevate server running on http://localhost:${PORT}`);
});