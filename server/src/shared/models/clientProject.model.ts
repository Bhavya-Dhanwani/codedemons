// Importing modules
import mongoose from "mongoose";
import { PHASES } from "./client.model.js";

export const SIDES = ["client", "studio"] as const;

// a project a client asked for (from the portal) or we opened for them (from the CRM)
const clientProjectSchema = new mongoose.Schema({

    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    name: { type: String, required: [true, "Name is required"], trim: true },
    brief: { type: String, default: "" },
    services: { type: [String], default: [] },
    budget: { type: String, default: "" },
    deadline: { type: Date, default: null },

    phase: { type: String, enum: PHASES, default: "planning" },
    milestones: [{ title: String, done: { type: Boolean, default: false } }],
    updates: [{ text: String, at: { type: Date, default: Date.now } }],

    // the conversation between the client and us
    messages: [{ from: { type: String, enum: SIDES }, text: String, at: { type: Date, default: Date.now } }],
    // unread = the other side's last message is newer than my last read
    lastFrom: { client: { type: Date, default: null }, studio: { type: Date, default: null } },
    readAt: { client: { type: Date, default: null }, studio: { type: Date, default: null } },

}, { timestamps: true });

const ClientProject = mongoose.model("ClientProject", clientProjectSchema);

export default ClientProject;
