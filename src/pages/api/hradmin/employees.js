import connectDB from "@/lib/db";
import Employee from "@/models/Employee";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const employees = await Employee.find({});
    return res.status(200).json(employees);
  }

  if (req.method === "POST") {
    const newEmployee = await Employee.create(JSON.parse(req.body));
    return res.status(201).json(newEmployee);
  }

  res.status(405).end();
}
