import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import IUser from "../interfaces/UserInterface.js";

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    trim: true,
  },
});

export interface IRole extends mongoose.Document {
  name: string;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
      validator: function (value: string) {
        return value.length >= 5;
      },
      message: "Name must be at least 5 characters long.",
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (value: string) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
      },
      message: "Email is not valid.",
    },
  },
  password: {
    type: String,
    required: true,
    set: function (this: IUser, plainPassword: string): string {
      // Hash password before storing it
      return bcrypt.hashSync(plainPassword, 7);
    },
    get: function (this: IUser, hashedPassword: string): string {
      // Return hashed password when accessed
      return hashedPassword;
    },
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: "64d3f76dba59ae4c470f901f",
    },
  ],
});

const RoleModel = mongoose.model<IRole>("Role", RoleSchema);
const UserModel = mongoose.model<IUser>("User", UserSchema);

export { RoleModel, UserModel };
