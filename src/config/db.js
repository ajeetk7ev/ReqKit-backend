import mongoose from 'mongoose';
import env from './env';


const dbConnect = async() => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log("DB Connected Successfully");
    } catch (error) {
        console.log("Failed to connect to the DB", error);
        process.exit(1);
    }
}