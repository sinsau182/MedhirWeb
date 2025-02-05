import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function handler(req, res) {
    await connectDB();
  
    switch (req.method) {
        case "GET":
            try {
                const users = await User.find();
                res.status(200).json(users);
            } catch (error) {
                res.status(500).json({ error: "Failed to fetch users" });
            }
            break;
  
        case "POST":
            try {
                const { name, email, phone } = req.body;
                if (!name || !email || !phone) {
                    return res.status(400).json({ error: "All fields are required" });
                }
                const newUser = new User({ name, email, phone });
                await newUser.save();
                res.status(201).json(newUser);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to create user" });
            }
            break;
  
        case "PUT":
            try {
                const { id, ...updates } = req.body;
                if (!id) return res.status(400).json({ error: "ID is required" });
  
                const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
                if (!updatedUser) return res.status(404).json({ error: "User not found" });
  
                res.status(200).json(updatedUser);
            } catch (error) {
                res.status(500).json({ error: "Failed to update user" });
            }
            break;
  
        case "DELETE":
            try {
                const { id } = req.body;
                if (!id) return res.status(400).json({ error: "ID is required" });
  
                const deletedUser = await User.findByIdAndDelete(id);
                if (!deletedUser) return res.status(404).json({ error: "User not found" });
  
                res.status(200).json(deletedUser);
            } catch (error) {
                res.status(500).json({ error: "Failed to delete user" });
            }
            break;
  
        default:
            res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}
