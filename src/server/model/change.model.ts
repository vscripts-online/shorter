import * as mongoose from "mongoose";
import { IShort } from "./short.model";

export type ShortHistory = Pick<
  IShort,
  "alias" | "clicked" | "real_url" | "slug" | "tracking"
>;

export interface IChange {
  _id: mongoose.Schema.Types.ObjectId;
  short: mongoose.Schema.Types.ObjectId;
  data: ShortHistory;
}

const schema = new mongoose.Schema<IChange>(
  {
    short: { type: mongoose.Schema.Types.ObjectId, ref: "Short" },
    data: {} as ShortHistory,
  },
  { versionKey: false }
);

const name = "Change";

const model = () =>
  mongoose.models && mongoose.models[name]
    ? (mongoose.models[name] as mongoose.Model<IChange>)
    : mongoose.model<IChange>(name, schema);

export default model;
