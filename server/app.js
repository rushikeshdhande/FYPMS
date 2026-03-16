import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.js';
import { errorMiddleware } from './middlewares/error.js';
import authRouter from './router/userRoutes.js'
import adminRouter from './router/adminRoutes.js'

// Load environment variables from .env file
config();

// create express app
const app = express();

// Middleware
app.use(
// Configure CORS to allow requests from specific origins
cors({
// Pass the url
origin:[process.env.FRONTEND_URL],
methods: ['GET', 'POST', 'PUT', 'DELETE'],
credentials: true,
})
);

// Middleware to parse cookies and JSON bodies
app.use(cookieParser());

// Middleware to parse JSON bodies
app.use(express.json());

app.use(express.urlencoded({ extended : true}))

// Routes
app.use( "/api/v1/auth", authRouter);
app.use( "/api/v1/admin", adminRouter);

// Error Middleware (Always LAST)
app.use(errorMiddleware)

export default app;
