import mongoose from "mongoose";
import { type BaseSchema } from "./index";
import bcrypt from "bcrypt";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

const Schema = mongoose.Schema;

export interface IUser extends BaseSchema {
  name: string;
  email: string;
  active: boolean;
  password: string;
  role: UserRole;
  isValidPassword: (password: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    password: { type: String, required: true },
    role: { type: String, enum: UserRole, default: UserRole.USER },
  },
  { timestamps: true }
);

// save hashed password
UserSchema.pre("save", async function (next) {
  const hash = await bcrypt.hash(this.password, 12);
  this.password = hash;
  next();
});

// compare passwords
UserSchema.methods.isValidPassword = async function (password: string) {
  const compare = await bcrypt.compare(password, this.password);
  return compare;
};

export default mongoose.model<IUser>("user", UserSchema);
