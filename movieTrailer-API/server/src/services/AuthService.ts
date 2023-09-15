import { UserModel } from "../models/userModel.js";
import IUser from "../interfaces/UserInterface.js";
import bcrypt from "bcryptjs";
import TokenService from "./TokenService.js";

class AuthService {
  async isAdmin(user: IUser) {
    return user.roles.includes("64f6074b6b45117d0fb7fdf1");
  }
  async getAll() {
    try {
      const allUsers: IUser[] = await UserModel.find()
        .populate("roles")
        .select("-password");

      console.log(allUsers);

      return allUsers;
    } catch (err) {
      console.log(err);
    }
  }
  async getOne(userId: string) {
    try {
      const user: IUser = await UserModel.findById(userId)
        .populate("roles")
        .select("-password");
      return user;
    } catch (err) {
      console.log(err);
    }
  }

  async register(
    name: string,
    email: string,
    password: string,
    roleIds: string[] = []
  ): Promise<IUser> {
    try {
      const existingUser = await UserModel.findOne({ email });

      if (existingUser) {
        throw new Error(`User ${name} already exists`);
      }

      const rolesToAssign =
        roleIds.length > 0 ? roleIds : ["64f607236b45117d0fb7fdef"];

      const newUser: IUser = new UserModel({
        name,
        email,
        password,
        roles: rolesToAssign,
      });

      const savedUser = await newUser.save();

      return savedUser;
    } catch (error) {
      console.error(error);
      throw new Error("Registration failed.");
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: IUser } | null> {
    try {
      const user: IUser | null = await UserModel.findOne({ email });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return null;
      }

      const token = TokenService.generateAccessToken(user);

      return { token, user };
    } catch (err) {
      console.error(err);
      throw new Error("Login failed.");
    }
  }
}

export default new AuthService();
