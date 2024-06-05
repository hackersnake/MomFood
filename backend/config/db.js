import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('url').then(()=>console.log("DataBase Connected"));
}
