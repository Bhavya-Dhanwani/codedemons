// Importing modules
import express from "express";
import healthRouter from "./health.router.js";
import contentRouter from "../../modules/public/content/content.router.js";
import adminRouter from "../../modules/admin/admin.router.js";

// making the router
const router = express.Router();

// mounting the public routers
router.use("/health", healthRouter);
// user auth (modules/public/auth) is not mounted yet: admin only for now
router.use("/", contentRouter);
router.use("/admin", adminRouter);

// exporting the router
export default router;
