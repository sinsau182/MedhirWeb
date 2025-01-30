import { getSession } from "next-auth/react";
import { connectToDatabase } from "@/lib/db";
import Leave from "@/models/Leave";

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session || !["admin", "hr_admin"].includes(session.user.role)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await connectToDatabase();

  if (req.method === "POST") {
    const { employeeId, startDate, endDate, reason } = req.body;
    const leave = new Leave({ employeeId, startDate, endDate, reason });
    await leave.save();
    res.status(201).json({ message: "Leave request submitted!" });
  }

  if (req.method === "GET") {
    const leaves = await Leave.find().populate("employeeId");
    res.status(200).json(leaves);
  }

  if (req.method === "PUT") {
    const { leaveId, status, approvedBy } = req.body;
    await Leave.findByIdAndUpdate(leaveId, { status, approvedBy });
    res.status(200).json({ message: "Leave status updated!" });
  }
}