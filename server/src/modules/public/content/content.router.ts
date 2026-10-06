// Importing modules
import express, { Request, Response } from "express";
import Project from "../../../shared/models/project.model.js";
import Review from "../../../shared/models/review.model.js";
import NotFound from "../../../shared/errors/NotFound.error.js";
import Ok from "../../../shared/responses/Ok.response.js";

// making the router
const router = express.Router();

/*
    @route GET /api/projects
    @desc Published projects in display order
    @access Public
*/
router.get("/projects", async (req: Request, res: Response) => {
    const projects = await Project.find({ published: true }).sort({ order: 1, createdAt: 1 }).select("-__v").lean();
    return Ok(res, "Projects", projects);
});

/*
    @route GET /api/projects/:slug
    @desc One published project
    @access Public
*/
router.get("/projects/:slug", async (req: Request<{ slug: string }>, res: Response) => {
    const project = await Project.findOne({ slug: req.params.slug, published: true }).select("-__v").lean();
    if (!project) throw new NotFound("Project not found");
    return Ok(res, "Project", project);
});

/*
    @route GET /api/reviews
    @desc Published client video reviews in display order
    @access Public
*/
router.get("/reviews", async (req: Request, res: Response) => {
    const reviews = await Review.find({ published: true }).sort({ order: 1, createdAt: 1 }).select("-__v").lean();
    return Ok(res, "Reviews", reviews);
});

// exporting the router
export default router;
