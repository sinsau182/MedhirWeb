import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    gst: {
        type: String,
        required: true,
    },
    regAdd: {
        type: String,
        required: true,
    },
});

export default mongoose.models.Company || mongoose.model("Company", companySchema);