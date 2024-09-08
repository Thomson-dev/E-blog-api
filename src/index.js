import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from './routes/user.routes.js';


import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from 'cookie-parser';
import cors from "cors";
dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
if (req.method == "OPTIONS") {
  res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
  return res.status(200).json({});
}

next();
});

app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(8000, () => {
  console.log("server listening on port 8000");
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
