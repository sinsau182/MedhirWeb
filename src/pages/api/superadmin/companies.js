import connectDB from "@/lib/db";
import Company from '@/models/Company';

export default async function handler(req, res) {
    await connectDB();
  
    switch (req.method) {
      case "GET":
        try {
          const companies = await Company.find();
          res.status(200).json(companies);
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch companies" });
        }
        break;
  
        case "POST":
          try {
            const { name, email, phone, gst, regAdd } = req.body;
            if (!name || !email || !phone || !gst || !regAdd) {
              return res.status(400).json({ error: "All fields are required" });
            }
            const newCompany = new Company({ name, email, phone, gst, regAdd });
            await newCompany.save();
            res.status(201).json(newCompany);
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to create company" });
          }
          break;
  
      case "PUT":
        try {
          const { id, ...updates } = req.body;
          if (!id) return res.status(400).json({ error: "ID is required" });
  
          const updatedCompany = await Company.findByIdAndUpdate(id, updates, { new: true });
          if (!updatedCompany) return res.status(404).json({ error: "Company not found" });
  
          res.status(200).json(updatedCompany);
        } catch (error) {
          res.status(500).json({ error: "Failed to update company" });
        }
        break;
  
      case "DELETE":
        try {
          const { id } = req.body;
          if (!id) return res.status(400).json({ error: "ID is required" });
  
          const deletedCompany = await Company.findByIdAndDelete(id);
          if (!deletedCompany) return res.status(404).json({ error: "Company not found" });
  
          res.status(200).json(deletedCompany);
        } catch (error) {
          res.status(500).json({ error: "Failed to delete company" });
        }
        break;
  
      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  }