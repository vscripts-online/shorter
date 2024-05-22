import * as mongoose from "mongoose";

export interface IShort {
  _id: mongoose.Schema.Types.ObjectId;
  user: number;
  real_url: string;
  slug: string;
  clicked: number;
  tracking: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IShort>(
  {
    user: Number,
    real_url: String,
    clicked: { type: Number, default: 0 },
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
