import connectDB from "@/lib/db";
import Employee from "@/models/Employee";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB(); // Connect to MongoDB
    const { name, email, phone, department, gender, title, reportingManager } =
      req.body;

    // Upsert employee data (create if not exists, update if exists)
    const employee = await Employee.findOneAndUpdate(
      { email }, // Find by unique email
      { name, phone, department, gender, title, reportingManager },
      { new: true, upsert: true } // Create new if not found
    );

    return res
      .status(200)
      .json({ message: "Employee saved successfully", employee });
  } catch (error) {
    console.error("Error saving employee:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
