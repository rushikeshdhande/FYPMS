// app.js
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/error.js';
import authRouter from './router/userRoutes.js';
import adminRouter from './router/adminRoutes.js';

// Load environment variables
config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL, // production
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// Other middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);

// Test route
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is running successfully!" 
  });
});

// Error Middleware (Always LAST)
app.use(errorMiddleware);

export default app;