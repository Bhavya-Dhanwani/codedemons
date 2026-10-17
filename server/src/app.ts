// Importing modules
import express, { Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import router from "./shared/routers/index.router.js";
import applyMiddlewares from "./shared/middlewares/index.middleware.js";
import notFoundHandler from "./shared/middlewares/NotFound.middleware.js";
import errorHandler from "./shared/middlewares/error.middleware.js";
import { setupSwagger } from "./shared/swagger.js";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectory = path.join(serverDirectory, "public");
const frontendIndex = path.join(publicDirectory, "index.html");

// function to make the app
function createApp(): Express {

    // create an express app
    const app = express();

    // applying middlewares
    applyMiddlewares(app);

    // adding the index router to the app
    app.use("/api", router);

    // API routes must continue returning JSON 404 responses instead of the SPA shell.
    app.use("/api", notFoundHandler);

    // setting up swagger documentation
    setupSwagger(app);

    // Serve a built frontend copied into server/public, when present.
    if (existsSync(frontendIndex)) {
        // hashed build files never change: cache them for a year. The page itself is always re-checked,
        // so after a deploy browsers pick up the new file names instead of asking for deleted ones.
        app.use("/assets", express.static(path.join(publicDirectory, "assets"), { immutable: true, maxAge: "1y" }));
        // a file from an older build: a real 404, never the page (browsers refuse HTML as CSS / JS)
        app.use("/assets", (req, res) => { res.status(404).type("text/plain").send("Not found"); });
        app.use(express.static(publicDirectory, { index: false }));

        // Express 5 requires a named wildcard. This lets client-side routes reload correctly.
        // "{*path}" also matches "/" itself, now that static files no longer serve index.html
        app.get("/{*path}", (req, res) => {
            res.setHeader("Cache-Control", "no-cache");
            res.sendFile(frontendIndex);
        });
    }

    // not found middleware
    app.use(notFoundHandler);

    // error handling middleware
    app.use(errorHandler);

    // returning the app
    return app;

}

export default createApp;
