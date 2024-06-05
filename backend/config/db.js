import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://shongaikwad10169:shon10169@cluster0.dhupsxb.mongodb.net/project').then(()=>console.log("DataBase Connected"));
}