import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Db from "./utils/db.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.BASE_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser()); // Add this line
// Routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.use("/api/v1/users", userRoutes);

// Database Connection
Db();

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server",
    });
});