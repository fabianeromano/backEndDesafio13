import { MongoDbContainer } from "../containers/mongodb.js";
import * as mongoose from "mongoose";

export const UsersSchema = new mongoose.Schema({
    email: { type: String },
    password: { type: String },
});

class UsersDaoMongoDb extends MongoDbContainer {
    constructor() {
        super("usuarios", UsersSchema);
    }
};

export default UsersDaoMongoDb;