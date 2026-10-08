// Importing modules
import mongoose from "mongoose";

const signature = {
    name: { type: String, default: "" },
    image: { type: String, default: "" }, // PNG data URL
    at: { type: Date, default: null },
    ip: { type: String, default: "" },
    hash: { type: String, default: "" }, // sha256 of the body that was signed
};

// a contract / SRS / onboarding doc the client reads and signs
const docSchema = new mongoose.Schema({

    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    kind: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },

    // draft (editable) -> sent (client can sign) -> signed (locked)
    status: { type: String, enum: ["draft", "sent", "signed"], default: "draft" },
    sentAt: { type: Date, default: null },
    remindedAt: { type: Date, default: null },

    us: signature,
    them: signature,

}, { timestamps: true });

// making the model for the doc schema
const Doc = mongoose.model("Doc", docSchema);

export default Doc;
