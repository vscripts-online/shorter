import { IShort } from "./model/short.model";

export interface IShortOutput extends Omit<IShort, "_id" | "user"> {
  _id: string;
  user?: string;
}
