import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from './routes/user.routes.js';
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// CORS configuration options
const corsOptions = {
  origin: ['https://eblog-three.vercel.app', 'http://localhost:3000'], // Allow multiple origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent with requests
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Enable CORS with the specified options
app.use(cors(corsOptions));

// Define routes
app.use('/api/user', userRoutes);
app.use("/api/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Hello world");
});

// Start the server
app.listen(8000, () => {
  console.log("Server listening on port 8000");
});

// Error-handling middleware function
app.use((err, req, res, next) => {
  // Get the status code from the error object, or default to 500 if not provided
  const statusCode = err.statusCode || 500;

  // Get the message from the error object, or default to 'Internal Server Error' if not provided
  const message = err.message || "Internal Server Error";

  // Send a JSON response with the status code and error message
  res.status(statusCode).json({
    success: false, // Indicate that the request was not successful
    statusCode, // Include the status code in the response
    message, // Include the error message in the response
  });
});