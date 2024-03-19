import { IShort } from "./model/short.model";
import { IUser } from "./model/user.model";

export interface IShortOutput extends Omit<IShort, "_id" | "user"> {
  _id: string;
  user?: string;
}

export interface IUserOutput extends Omit<IUser, "_id"> {
  _id: string;
}
