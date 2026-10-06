// Copies site content (projects + reviews) from the local DB into another DB, e.g. the cloud one.
// Run with: npm run copy-db -- "<target mongo uri>"   (source defaults to MONGO_URI from .env)
// Upserts by _id, so re-running is safe. Auth collections (users, sessions, tokens) are skipped.
import dns from "node:dns";
import mongoose from "mongoose";
import env from "./shared/config/env.config.js";

// Local/router DNS often refuses SRV lookups needed by mongodb+srv:// URIs.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const target = process.argv[2];
if (!target) throw new Error('Usage: npm run copy-db -- "<target mongo uri>"');

const src = await mongoose.createConnection(env.MONGO_URI).asPromise();
const dst = await mongoose.createConnection(target).asPromise();

for (const name of ["projects", "reviews"]) {
    const docs = await src.db!.collection(name).find().toArray();
    if (docs.length) await dst.db!.collection(name).bulkWrite(docs.map((d) => ({ replaceOne: { filter: { _id: d._id }, replacement: d, upsert: true } })));
    console.log(`${name}: copied ${docs.length}`);
}

await Promise.all([src.close(), dst.close()]);
