import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  department: { type: String, required: true },
  gender: { 
    type: String, 
    enum: ["male", "female", "other"], 
    required: true,
    lowercase: true  // Automatically converts input to lowercase
  },
  title: { type: String, required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.models.Employee || mongoose.model("Employee", employeeSchema);