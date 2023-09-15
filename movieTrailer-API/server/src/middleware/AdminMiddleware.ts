import { Response, Request, NextFunction } from "express";
import TokenService from "../services/TokenService.js";

export default function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authToken.split(" ")[1];

  const decodedPayload = TokenService.validateAccessToken(token);

  if (!decodedPayload) {
    return res.status(401).json({ error: "Invalid Bearer token" });
  }

  if (!decodedPayload.roles.includes("64f6074b6b45117d0fb7fdf1")) {
    return res
      .status(403)
      .json({ error: "Access denied. User is not an admin." });
  }

  req.user = decodedPayload;

  next();
}
