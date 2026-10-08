// Importing modules
import mongoose from "mongoose";
import { forgetClient } from "../utils/licenseCache.util.js";

export const STAGES = ["new", "contacted", "proposal", "won", "lost"] as const;
export const PHASES = ["planning", "design", "build", "review", "live"] as const;

// one record per person: starts as a lead, becomes a client when won
const clientSchema = new mongoose.Schema({

    name: { type: String, required: [true, "Name is required"], trim: true },
    email: { type: String, default: "", trim: true, lowercase: true, index: true },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    services: { type: [String], default: [] },
    message: { type: String, default: "" },
    source: { type: String, default: "manual" },

    // pipeline
    stage: { type: String, enum: STAGES, default: "new", index: true },
    value: { type: Number, default: 0 },
    followUpAt: { type: Date, default: null, index: true },
    notes: [{ text: String, at: { type: Date, default: Date.now } }],

    // what the client sees in their portal
    portal: { type: Boolean, default: false },
    phase: { type: String, enum: PHASES, default: "planning" },
    milestones: [{ title: String, done: { type: Boolean, default: false } }],
    updates: [{ text: String, at: { type: Date, default: Date.now } }],

    // website license: `on` is the manual switch, paidUntil + graceDays is the automatic one
    license: {
        key: { type: String, default: "" },
        domain: { type: String, default: "" },
        on: { type: Boolean, default: true },
        paidUntil: { type: Date, default: null },
        graceDays: { type: Number, default: 7 },
        message: { type: String, default: "" },
        // what visitors see while the site is down (drawn by the license script)
        page: {
            heading: { type: String, default: "" },
            logo: { type: String, default: "" },
            bg: { type: String, default: "#f2f1ed" },
            fg: { type: String, default: "#0d0d12" },
            accent: { type: String, default: "#2b3bff" },
            buttonLabel: { type: String, default: "" },
            buttonUrl: { type: String, default: "" },
        },
    },

    // one-time login code (hashed)
    login: {
        code: { type: String, default: "" },
        exp: { type: Date, default: null },
        tries: { type: Number, default: 0 },
    },

}, { timestamps: true });

clientSchema.index({ "license.key": 1 }, { unique: true, partialFilterExpression: { "license.key": { $gt: "" } } });

// any change to a client may change its license: drop the cached copy (all writes go through save / doc.deleteOne)
clientSchema.post("save", (doc) => forgetClient(String(doc._id)));
clientSchema.post("deleteOne", { document: true, query: false }, (doc) => forgetClient(String(doc._id)));

// making the model for the client schema
const Client = mongoose.model("Client", clientSchema);

export default Client;
