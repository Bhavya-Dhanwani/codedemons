// Importing modules
import express, { Express } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import env from "../config/env.config.js";

// function to apply middlewares to the app
function applyMiddlewares(app: Express) {

    // applying middlewares
    app.use(compression());

    app.use(cors());

    // ImageKit serves media and accepts direct uploads from the admin panel
    const media = ["'self'", "data:", "blob:", "https://ik.imagekit.io"];
    const endpoint = env.IMAGEKIT_URL_ENDPOINT && new URL(env.IMAGEKIT_URL_ENDPOINT).origin;
    if (endpoint && !media.includes(endpoint)) media.push(endpoint);

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                imgSrc: media,
                mediaSrc: media,
                connectSrc: ["'self'", "https://upload.imagekit.io"],
            },
        },
    }));

    app.use(hpp());

    app.use(cookieParser());

    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

    app.use(express.json({ limit: "100kb" }));

    app.use(express.urlencoded({ extended: true, limit: "100kb" }));

}

export default applyMiddlewares;
