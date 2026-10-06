// Importing modules
import mongoose from "mongoose";

// defining the schema for a client video review
const reviewSchema = new mongoose.Schema({

    who: { type: String, required: [true, "Client name is required"], trim: true },
    company: { type: String, default: "", trim: true },
    quote: { type: String, default: "" },
    video: { type: String, default: "" },
    poster: { type: String, default: "" },

    published: { type: Boolean, default: true },
    order: { type: Number, default: 0, index: true },

}, { timestamps: true });

// making the model for the review schema
const Review = mongoose.model("Review", reviewSchema);

export default Review;
