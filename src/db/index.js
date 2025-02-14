import mongoose, { connect } from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  //connecting to mongoDB database and most imp use async await and try catch
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MongoDB connected !! DB Host : ${connectionInstance.connection.host} \n`
    );
  } catch (error) {
    console.log("MongoDB Connection error", error);
    process.exit(1);
  }
};
export default connectDB;
