// Importing modules
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import BadRequest from "../errors/BadRequest.error.js";

// uploads live in server/uploads and are served at /uploads
export const uploadDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../uploads");
mkdirSync(uploadDirectory, { recursive: true });

// only these media types are accepted; the extension comes from the type, never from the client
const ALLOWED: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
};

// configuring multer to store files with random names
const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDirectory,
        filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString("hex") + ALLOWED[file.mimetype]),
    }),
    limits: { fileSize: 300 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED[file.mimetype]) return cb(null, true);
        cb(new BadRequest("Only images (jpg, png, webp, avif, gif) and videos (mp4, webm, mov) are allowed."));
    },
});

export default upload;
