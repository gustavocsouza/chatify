import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) throw new Error("MONGO_URL is not set");

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);


  } catch (error) { 
    console.error("Error to connect to MongoDB", error);
    process.exit(1); // 1 status code means failt, 0 means success
  }
}