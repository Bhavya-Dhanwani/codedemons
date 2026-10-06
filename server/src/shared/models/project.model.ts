// Importing modules
import mongoose from "mongoose";

// defining the schema for a portfolio project
const projectSchema = new mongoose.Schema({

    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: [true, "Name is required"], trim: true },
    kind: { type: String, default: "", trim: true },
    year: { type: String, default: "", trim: true },
    client: { type: String, default: "", trim: true },
    services: { type: [String], default: [] },
    intro: { type: String, default: "" },
    challenge: { type: String, default: "" },
    solution: { type: String, default: "" },
    results: { type: [{ v: String, l: String, _id: false }], default: [] },
    tint: { type: String, default: "#e9e8e2" },
    liveUrl: { type: String, default: "" },

    // media: uploaded file URLs
    cover: { type: String, default: "" },
    detail: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    video: { type: String, default: "" },

    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0, index: true },

}, { timestamps: true });

// making the model for the project schema
const Project = mongoose.model("Project", projectSchema);

export default Project;
