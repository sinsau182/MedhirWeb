import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: { type: String },
  title: { type: String }, // Job Title
  email: { type: String },
  phone: { 
    type: String,
    match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"]
  },
  department: { type: String },
  gender: { 
    type: String, 
    enum: ["male", "female", "other"],
    lowercase: true  // Automatically converts input to lowercase
  },
  reportingManager: { type: String },
  permanentAddress: { type: String },
  currentAddress: { type: String },

  // ✅ ID Proofs Section
  idProofs: {
    aadharNo: { type: String }, 
    panNo: { type: String }, 
    passport: { type: String }, 
    drivingLicense: { type: String }, 
    voterId: { type: String }
  },

    // ✅ Bank Details Section
    bankDetails: {
      accountNumber: { type: String }, 
      accountHolderName: { type: String },
      ifscCode: { type: String }, 
      bankName: { type: String },
      branchName: { type: String }
    },

  // ✅ Salary Details Section
  salaryDetails: {
    totalCtc: { type: Number },
    basic: { type: Number }, 
    allowances: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    pf: { type: Number }
  },

}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
