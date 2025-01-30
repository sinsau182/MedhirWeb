import connectDB from "@/lib/db";

export default async function handler(req, res) {
    try {
        await connectDB();
        res.status(200).json({ success: true, message: "MongoDB is connected" });
    } catch (error) {
        res.status(500).json({ success: false, message: "MongoDB connection failed", error: error.message });
    }
}
