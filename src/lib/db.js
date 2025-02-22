import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to db");
  } catch (err) {
    console.log(err);
  }
};

export default connectDB;
