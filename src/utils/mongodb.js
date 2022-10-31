import * as mongoose from "mongoose";

export async function connectMongoDb() {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test');
}

export default mongoose;