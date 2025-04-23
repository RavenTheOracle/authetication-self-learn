import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const Db = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => {
        console.log("Bhai ho gaya connect")
    })
    .catch((error) => {
        console.log(`Error connecting database:`, error)
    })
}

export default Db;