import * as mongoose from "mongoose";

export interface IShort {
  _id: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  real_url: string;
  url: string;
  alias?: string;
  slug: string;
  clicked: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IShort>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    real_url: String,
    clicked: { type: Number, default: 0 },
    url: String,
    alias: String,
    slug: { type: String, unique: true },
    createdAt: Date,
    updatedAt: Date,
  },
  { timestamps: true }
);

const name = "Short";

const model = () =>
  mongoose.models && mongoose.models[name]
    ? (mongoose.models[name] as mongoose.Model<IShort>)
    : mongoose.model<IShort>(name, schema);

export default model;
