import * as mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
  password: string;
}

const schema = new mongoose.Schema<IUser>({
  email: { type: String, unique: true },
  password: String,
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

const name = "User";

const model = () =>
  mongoose.models && mongoose.models[name]
    ? (mongoose.models[name] as mongoose.Model<IUser>)
    : mongoose.model<IUser>(name, schema);

export default model;
