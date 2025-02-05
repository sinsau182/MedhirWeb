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
        unique: true, 
        match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
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