import dotenv from 'dotenv';
dotenv.config();


const env = {
    PORT:process.env.PORT || 5000,
    MONGO_URI:process.env.MONGO_URI
}



export default env;