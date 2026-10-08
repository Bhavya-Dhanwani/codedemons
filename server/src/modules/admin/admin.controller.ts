// Importing modules
import { Request, Response } from "express";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import z from "zod";
import env from "../../shared/config/env.config.js";
import Project from "../../shared/models/project.model.js";
import Review from "../../shared/models/review.model.js";
import BadRequest from "../../shared/errors/BadRequest.error.js";
import NotFound from "../../shared/errors/NotFound.error.js";
import Unauthorized from "../../shared/errors/Unauthorized.error.js";
import ApiError from "../../shared/utils/ApiError.util.js";
import Ok from "../../shared/responses/Ok.response.js";
import Created from "../../shared/responses/Created.response.js";

// ---------- validation schemas ----------
const mediaUrl = z.string().trim().max(500).refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), "Must be an uploaded file or a full URL");

const projectSchema = z.object({
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]*$/, "Slug can only contain a-z, 0-9 and dashes").max(80).optional(),
    name: z.string().trim().min(1, "Name is required").max(120),
    kind: z.string().trim().max(80).default(""),
    year: z.string().trim().max(10).default(""),
    client: z.string().trim().max(120).default(""),
    services: z.array(z.string().trim().max(60)).max(20).default([]),
    intro: z.string().max(400).default(""),
    challenge: z.string().max(3000).default(""),
    solution: z.string().max(3000).default(""),
    results: z.array(z.object({ v: z.string().max(20), l: z.string().max(60) })).max(6).default([]),
    tint: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Tint must be a hex colour like #e9e8e2").default("#e9e8e2"),
    liveUrl: z.string().trim().max(300).refine((v) => v === "" || /^https?:\/\//.test(v), "Live URL must start with http").default(""),
    cover: mediaUrl.default(""),
    detail: mediaUrl.default(""),
    gallery: z.array(mediaUrl).max(20).default([]),
    video: mediaUrl.default(""),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
});

const reviewSchema = z.object({
    who: z.string().trim().min(1, "Client name is required").max(120),
    company: z.string().trim().max(120).default(""),
    quote: z.string().max(600).default(""),
    video: mediaUrl.default(""),
    poster: mediaUrl.default(""),
    published: z.boolean().default(true),
});

// parses a body or throws a readable 400
export function parse<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
    const result = schema.safeParse(body);
    if (!result.success) {
        const issue = result.error.issues[0];
        throw new BadRequest(`${issue.path.join(".") || "body"}: ${issue.message}`);
    }
    return result.data;
}

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "project";

const checkId = (id: string) => {
    if (!mongoose.isValidObjectId(id)) throw new NotFound("Not found");
};

// ---------- login rate limiting ----------
// ponytail: in-memory per-IP limit, resets on restart; use a shared store if running several instances
const attempts = new Map<string, { n: number; until: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

// constant-time string comparison
const same = (a: string, b: string) => {
    const x = crypto.createHash("sha256").update(a).digest();
    const y = crypto.createHash("sha256").update(b).digest();
    return crypto.timingSafeEqual(x, y);
};

// class to handle admin panel operations
class AdminController {

    // log in with the admin credentials from the environment
    login = async (req: Request, res: Response) => {
        if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) throw new Unauthorized("Admin login is not configured on the server.");

        const ip = req.ip || "unknown";
        const now = Date.now();
        const a = attempts.get(ip);
        if (a && a.until > now && a.n >= MAX_ATTEMPTS) throw new ApiError(429, "Too many attempts. Try again in a few minutes.");

        const { email, password } = parse(z.object({ email: z.string().trim().min(1, "Enter your email").max(200), password: z.string().min(1, "Enter your password").max(200) }), req.body);

        if (!(same(email.trim().toLowerCase(), env.ADMIN_EMAIL.toLowerCase()) && same(password, env.ADMIN_PASSWORD))) {
            attempts.set(ip, { n: (a && a.until > now ? a.n : 0) + 1, until: now + WINDOW_MS });
            throw new Unauthorized("Wrong email or password.");
        }

        attempts.delete(ip);
        const token = jwt.sign({ role: "admin", email: env.ADMIN_EMAIL }, env.ACCESS_TOKEN_SECRET, { expiresIn: "12h" });
        return Ok(res, "Logged in", { token });
    };

    // ---------- projects ----------
    listProjects = async (req: Request, res: Response) => {
        const projects = await Project.find().sort({ order: 1, createdAt: 1 }).lean();
        return Ok(res, "Projects", projects);
    };

    createProject = async (req: Request, res: Response) => {
        const data = parse(projectSchema, req.body);
        let slug = data.slug || slugify(data.name);
        // keep slugs unique by suffixing -2, -3...
        for (let i = 2; await Project.exists({ slug }); i++) slug = `${data.slug || slugify(data.name)}-${i}`;
        const last = await Project.findOne().sort({ order: -1 }).lean();
        const project = await Project.create({ ...data, slug, order: (last?.order ?? -1) + 1 });
        return Created(res, "Project created", project);
    };

    updateProject = async (req: Request<{ id: string }>, res: Response) => {
        checkId(req.params.id);
        const data = parse(projectSchema, req.body);
        const slug = data.slug || slugify(data.name);
        if (await Project.exists({ slug, _id: { $ne: req.params.id } })) throw new BadRequest(`slug: "${slug}" is already used by another project`);
        const project = await Project.findByIdAndUpdate(req.params.id, { ...data, slug }, { new: true });
        if (!project) throw new NotFound("Project not found");
        return Ok(res, "Project updated", project);
    };

    deleteProject = async (req: Request<{ id: string }>, res: Response) => {
        checkId(req.params.id);
        // ponytail: uploaded files are kept on disk after delete; add cleanup if storage grows
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) throw new NotFound("Project not found");
        return Ok(res, "Project deleted");
    };

    reorderProjects = async (req: Request, res: Response) => {
        const { ids } = parse(z.object({ ids: z.array(z.string()).max(500) }), req.body);
        if (!ids.every((id) => mongoose.isValidObjectId(id))) throw new BadRequest("ids: invalid id");
        await Project.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
        return Ok(res, "Order saved");
    };

    // ---------- reviews ----------
    listReviews = async (req: Request, res: Response) => {
        const reviews = await Review.find().sort({ order: 1, createdAt: 1 }).lean();
        return Ok(res, "Reviews", reviews);
    };

    createReview = async (req: Request, res: Response) => {
        const data = parse(reviewSchema, req.body);
        const last = await Review.findOne().sort({ order: -1 }).lean();
        const review = await Review.create({ ...data, order: (last?.order ?? -1) + 1 });
        return Created(res, "Review created", review);
    };

    updateReview = async (req: Request<{ id: string }>, res: Response) => {
        checkId(req.params.id);
        const review = await Review.findByIdAndUpdate(req.params.id, parse(reviewSchema, req.body), { new: true });
        if (!review) throw new NotFound("Review not found");
        return Ok(res, "Review updated", review);
    };

    deleteReview = async (req: Request<{ id: string }>, res: Response) => {
        checkId(req.params.id);
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) throw new NotFound("Review not found");
        return Ok(res, "Review deleted");
    };

    reorderReviews = async (req: Request, res: Response) => {
        const { ids } = parse(z.object({ ids: z.array(z.string()).max(500) }), req.body);
        if (!ids.every((id) => mongoose.isValidObjectId(id))) throw new BadRequest("ids: invalid id");
        await Review.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
        return Ok(res, "Order saved");
    };

    // ---------- uploads ----------

    // one-time signature so the admin browser can upload straight to ImageKit (private key never leaves the server)
    imagekitAuth = async (req: Request, res: Response) => {
        if (!env.IMAGEKIT_PUBLIC_KEY || !env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_URL_ENDPOINT) {
            throw new ApiError(503, "Uploads need ImageKit. Add IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT to server/.env.");
        }
        const token = crypto.randomUUID();
        const expire = Math.floor(Date.now() / 1000) + 30 * 60;
        const signature = crypto.createHmac("sha1", env.IMAGEKIT_PRIVATE_KEY).update(token + expire).digest("hex");
        return Ok(res, "ImageKit upload auth", {
            token, expire, signature,
            publicKey: env.IMAGEKIT_PUBLIC_KEY,
            folder: env.IMAGEKIT_FOLDER,
        });
    };

}

export default AdminController;
