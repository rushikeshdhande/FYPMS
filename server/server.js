// server.js
import { connectDB } from "./config/db.js";
import app from "./app.js";

// Database connection
connectDB();

// Start server
const PORT = process.env.PORT || 4000;

// Server listen
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Unhandled rejection handle the error which is not handled by try-catch block
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Uncaught exception handle the error which is not handled by try-catch block
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Optional: Handle SIGTERM (for graceful shutdown in production)
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

export default server;