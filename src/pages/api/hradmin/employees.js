import connectDB from "@/lib/db";
import Employee from "@/models/Employee";

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
      case "PUT":
        return handlePut(req, res);
      case "DELETE":
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGet(req, res) {
  try {
    const employees = await Employee.find()
      .populate("reportingManager", "name email")
      .select("-__v");
    return res.status(200).json(employees);
  } catch (error) {
    console.error("GET Error:", error);
    return res.status(500).json({ error: "Failed to fetch employees" });
  }
}

async function handlePost(req, res) {
  try {
    const {
      name,
      email,
      phone,
      department,
      gender,
      title,
      reportingManager,
      permanentAddress,
      currentAddress,
      idProofs,
      bankDetails,
      salaryDetails,
    } = req.body;

    if (!name)
      return res.status(400).json({ error: "Employee name is required" });
    const validGenders = ["male", "female", "other"];
    const processedGender =
      gender && validGenders.includes(gender.toLowerCase())
        ? gender.toLowerCase()
        : undefined;

    const newEmployee = new Employee({
      name,
      email,
      phone,
      department,
      gender: processedGender,
      title,
      reportingManager,
      permanentAddress,
      currentAddress,
      idProofs: idProofs || {},
      bankDetails: bankDetails || {},
      salaryDetails: salaryDetails || {},
    });
    await newEmployee.save();
    return res
      .status(201)
      .json({
        message: "Employee created successfully",
        employee: newEmployee,
      });
  } catch (error) {
    console.error("POST Error:", error);
    return res.status(500).json({ error: "Failed to save employee" });
  }
}

async function handlePut(req, res) {
  try {
    const { id, ...updates } = req.body;

    if (!id) return res.status(400).json({ error: "Employee ID is required" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Employee ID" });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("reportingManager", "name email");

    if (!updatedEmployee)
      return res.status(404).json({ error: "Employee not found" });

    return res
      .status(200)
      .json({
        message: "Employee updated successfully",
        employee: updatedEmployee,
      });
  } catch (error) {
    console.error("PUT Error:", error);
    return res.status(500).json({ error: "Failed to update employee" });
  }
}

async function handleDelete(req, res) {
  try {
    const { employeeId } = req.body;
    if (!employeeId)
      return res.status(400).json({ error: "Employee ID is required" });

    const deletedEmployee = await Employee.findByIdAndDelete(employeeId);
    if (!deletedEmployee)
      return res.status(404).json({ error: "Employee not found" });

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return res.status(500).json({ error: "Failed to delete employee" });
  }
}
