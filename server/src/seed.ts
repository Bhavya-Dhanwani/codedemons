// Run with: npm run seed. Adds the sample projects only when there are none.
import mongoose from "mongoose";
import env from "./shared/config/env.config.js";
import { seedProjects } from "./shared/utils/seedProjects.util.js";

await mongoose.connect(env.MONGO_URI);
await seedProjects();
await mongoose.disconnect();
