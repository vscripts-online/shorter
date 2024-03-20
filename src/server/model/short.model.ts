import * as mongoose from "mongoose";

export interface IShort {
  _id: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  real_url: string;
  alias: string;
  slug: string;
  clicked: number;
  tracking: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IShort>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    real_url: String,
    clicked: { type: Number, default: 0 },
    alias: { type: String, unique: true },
    slug: { type: String, unique: true },
    tracking: { type: String },
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true, optimisticConcurrency: true }
);

const name = "Short";

const model = () =>
  mongoose.models && mongoose.models[name]
    ? (mongoose.models[name] as mongoose.Model<IShort>)
    : mongoose.model<IShort>(name, schema);

export default model;
