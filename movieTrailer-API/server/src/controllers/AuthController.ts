import { NextFunction, Request, Response } from "express";
import AuthService from "../services/AuthService.js";
import { IRole, RoleModel } from "../models/userModel.js";
import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

class AuthController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userRoles = req.user.roles;

      if (!userRoles.includes("64f6074b6b45117d0fb7fdf1")) {
        throw ApiError.ForbiddenError("Access denied. User is not an admin.");
      }

      const allUsers = await AuthService.getAll();

      res.status(200).json(allUsers);
    } catch (err) {
      next(err);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        throw ApiError.InternalServerError("Error during registration.");
      }
      const { name, email, password, roleIds } = req.body;
      const newUser = await AuthService.register(
        name,
        email,
        password,
        roleIds
      );

      res.status(201).json(newUser);
    } catch (err) {
      next(ApiError.InternalServerError("Registration failed"));
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const user = await AuthService.login(email, password);

      if (!user) {
        throw ApiError.UnauthorizedError("Authentication failed");
      }

      res.status(200).json(user);
    } catch (error) {
      next(ApiError.InternalServerError("Server error"));
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      const createdRole: IRole = await RoleModel.create({ name: name });
      return res.status(201).json(createdRole);
    } catch (err) {
      next(err);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const roleID = req.params.id;

      const deletedRole: IRole | null = await RoleModel.findByIdAndDelete(
        roleID
      );

      if (!deletedRole) {
        throw ApiError.NotFoundError("Role not found");
      }

      res.status(201).json(deletedRole);
    } catch (err) {
      next(ApiError.InternalServerError("Failed to delete role"));
    }
  }
}

export default new AuthController();
