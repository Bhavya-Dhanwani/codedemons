// Importing modules
import express from "express";
import AdminController from "./admin.controller.js";
import adminMiddleware from "../../shared/middlewares/admin.middleware.js";
import crmRouter from "./crm.router.js";

// making the router
const router = express.Router();

// creating an admin controller instance
const adminController = new AdminController();

/*
    @route POST /api/admin/login
    @desc Log in to the admin panel
    @access Public (rate limited)
*/
router.post("/login", adminController.login);

// everything below requires an admin token
router.use(adminMiddleware);

/*
    @route GET|POST /api/admin/projects, PUT /api/admin/projects/order, PUT|DELETE /api/admin/projects/:id
    @desc Manage portfolio projects
    @access Admin
*/
router.get("/projects", adminController.listProjects);
router.post("/projects", adminController.createProject);
router.put("/projects/order", adminController.reorderProjects);
router.put("/projects/:id", adminController.updateProject);
router.delete("/projects/:id", adminController.deleteProject);

/*
    @route GET|POST /api/admin/reviews, PUT /api/admin/reviews/order, PUT|DELETE /api/admin/reviews/:id
    @desc Manage client video reviews
    @access Admin
*/
router.get("/reviews", adminController.listReviews);
router.post("/reviews", adminController.createReview);
router.put("/reviews/order", adminController.reorderReviews);
router.put("/reviews/:id", adminController.updateReview);
router.delete("/reviews/:id", adminController.deleteReview);

/*
    @route GET /api/admin/imagekit-auth
    @desc Short-lived signature for a direct browser upload to ImageKit. All media lives on ImageKit; files never touch this server.
    @access Admin
*/
router.get("/imagekit-auth", adminController.imagekitAuth);

/*
    @route /api/admin/crm/*, /api/admin/clients/*, /api/admin/invoices/*, /api/admin/docs/*
    @desc Leads, clients, documents, invoices and licenses
    @access Admin
*/
router.use("/", crmRouter);

// exporting the router
export default router;
