import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);