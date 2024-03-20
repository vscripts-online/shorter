import * as mongoose from "mongoose";

export interface IClick {
  _id: mongoose.Schema.Types.ObjectId;
  short: mongoose.Schema.Types.ObjectId;
  user_agent: string;
  referer: string;
  ip: string;
  tracking: string;
}

const schema = new mongoose.Schema<IClick>(
  {
    short: { type: mongoose.Schema.Types.ObjectId, ref: "Short" },
    user_agent: String,
    referer: String,
    ip: String,
    tracking: String,
  },
  { versionKey: false }
);

const name = "Click";

const model = () =>
  mongoose.models && mongoose.models[name]
    ? (mongoose.models[name] as mongoose.Model<IClick>)
    : mongoose.model<IClick>(name, schema);

export default model;
