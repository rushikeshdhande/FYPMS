import { connectDB } from "./config/db.js";
import app from "./app.js";

// DataBase connection
connectDB();

// Start server
const PORT = process.env.PORT || 4000;

// SErver listen
const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
})

// server crashed error handled  || Error handling

// unhandledRejection handle the error which is not handled by try (catch   ) block
process.on("unhandledRejection", (err) => {
        console.error(`Unhandled Rejection : ${err.message}`);
        server.close(() => process.exit(1));
})

// uncaughtException handle the error which is not handled by try catch block
process.on("uncaughtException", (err) => {
        console.error(`Uncaught Exception : ${err.message}`);
        process.exit(1);
})

export default server;
