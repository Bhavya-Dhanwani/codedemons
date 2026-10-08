// Importing modules
import mongoose from "mongoose";

// a payment request shown in the client portal
const invoiceSchema = new mongoose.Schema({

    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    number: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 }, // rupees
    dueAt: { type: Date, required: true },

    // due -> verifying (client says they paid by UPI) -> paid
    status: { type: String, enum: ["due", "verifying", "paid"], default: "due", index: true },
    utr: { type: String, default: "" },
    paidAt: { type: Date, default: null },

    // days added to the client's license when this is paid (0 = none)
    licenseDays: { type: Number, default: 0 },

    // Razorpay payment link, when configured
    link: { id: { type: String, default: "" }, url: { type: String, default: "" } },

    remindedAt: { type: Date, default: null },

}, { timestamps: true });

// making the model for the invoice schema
const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
