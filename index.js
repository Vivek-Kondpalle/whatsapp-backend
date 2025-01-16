import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8747;
const databaseUrl = process.env.DATABASE_URL;

console.log(' process.env.ORIGIN ', process.env.ORIGIN)

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
    } else {
        next();
    }
});

app.use('/uploads/profiles', express.static('uploads/profiles'));

// CORS Middleware
// app.use(cors({
//     origin: process.env.ORIGIN || 'http://localhost:5173',
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
// }));

// // Handle Preflight Requests
// app.options("*", cors({
//     origin: process.env.ORIGIN || 'http://localhost:5173',
//     credentials: true
// }));


app.use(cookieParser())
app.use(express.json())


app.use("/api/auth", authRoutes)
app.use("/api/contacts", contactsRoutes)

const server = app.listen(port, () => {
  console.log(" Server is running on port", port);
});

mongoose
  .connect(databaseUrl)
  .then(() => console.log(" DB connected "))
  .catch((error) =>
    console.log(" Error while connecting DB => ", error.message)
  );
