import * as mongoose from "mongoose";

async function connectMongoose() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DBNAME;
  if (!uri) {
    throw new Error("MONGO_URI Not found at .env file");
  }

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri, { dbName });
    console.log("connected to mongo");
  }
}

export default connectMongoose;
