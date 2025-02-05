import connectDB from "@/lib/db";
import Employee from "@/models/Employee";

export default async function handler(req, res) {
    await connectDB();

    try {
        switch (req.method) {
            case "GET":
                const employees = await Employee.find()
                    .populate("reportingManager", "name email")
                    .select("-__v"); // Excludes MongoDB version key
                return res.status(200).json(employees);

            case "POST":
                const { name, email, phone, department, gender, title, reportingManager } = req.body;

                if (!name || !email || !phone || !department || !gender || !title) {
                    return res.status(400).json({ error: "All fields except reportingManager are required" });
                }

                const validGenders = ["male", "female", "other"];
                const formattedGender = gender.toLowerCase();
                if (!validGenders.includes(formattedGender)) {
                    return res.status(400).json({ error: "Invalid gender. Allowed values: male, female, other" });
                }

                const employeeExists = await Employee.findOne({ email });
                if (employeeExists) {
                    return res.status(409).json({ error: "Employee with this email already exists" });
                }

                const newEmployee = new Employee({
                    name,
                    email,
                    phone,
                    department,
                    gender: formattedGender,
                    title,
                    reportingManager,
                });

                await newEmployee.save();
                return res.status(201).json({ message: "Employee created successfully", employee: newEmployee });

            case "PUT":
                const { id, ...updates } = req.body;
                if (!id) return res.status(400).json({ error: "Employee ID is required" });

                if (updates.gender) {
                    const genderLower = updates.gender.toLowerCase();
                    if (!validGenders.includes(genderLower)) {
                        return res.status(400).json({ error: "Invalid gender. Allowed values: male, female, other" });
                    }
                    updates.gender = genderLower;
                }

                const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, { new: true })
                    .populate("reportingManager", "name email");

                if (!updatedEmployee) return res.status(404).json({ error: "Employee not found" });

                return res.status(200).json({ message: "Employee updated successfully", employee: updatedEmployee });

            case "DELETE":
                const { employeeId } = req.body;
                if (!employeeId) return res.status(400).json({ error: "Employee ID is required" });

                const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
                if (!deletedEmployee) return res.status(404).json({ error: "Employee not found" });

                return res.status(200).json({ message: "Employee deleted successfully" });

            default:
                return res.status(405).json({ error: "Method Not Allowed" });
        }
    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
