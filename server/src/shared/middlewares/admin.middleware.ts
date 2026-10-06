// Importing modules
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import env from "../config/env.config.js";
import Unauthorized from "../errors/Unauthorized.error.js";
import Forbidden from "../errors/Forbidden.error.js";

// Function to allow only a logged in admin through
function adminMiddleware(req: Request, res: Response, next: NextFunction) {

    // getting the bearer token from the request headers
    const token = req.headers?.authorization?.split(" ")[1];

    if (!token) throw new Unauthorized("Admin unauthenticated.");

    let decoded: jwt.JwtPayload | string;

    try {

        // verifying the token
        decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    } catch {

        throw new Unauthorized("Session expired, please log in again.");

    }

    // the token must carry the admin role
    if (typeof decoded === "string" || decoded.role !== "admin") throw new Forbidden("Admin only.");

    next();

}

export default adminMiddleware;
