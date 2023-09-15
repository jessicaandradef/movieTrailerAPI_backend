import express from "express";
import MovieController from "../controllers/MovieController.js";
import authMiddleware from "../middleware/AuthMiddleware.js";
import { check } from "express-validator";
import adminMiddleware from "../middleware/AdminMiddleware.js";

const router = express.Router();

router.get("/movies", MovieController.getAll);

router.get("/movies/:id", MovieController.getOne);

router.post(
  "/movies",
  adminMiddleware,
  [
    check("title", "Title is required").notEmpty(),
    check("releaseDate", "Release Date must be a number").isDate(),
    check("trailerLink", "Trailer is required").notEmpty(),
    check("posterUrl", "Poster Url is required").notEmpty(),
    check("genres", "Genres is required").notEmpty(),
  ],
  MovieController.create
);

router.put("/movies/:id", adminMiddleware, MovieController.update);

router.post(
  "/movies/:id/ratings",
  authMiddleware,
  MovieController.createRating
);

router.delete("/movies/:id", adminMiddleware, MovieController.delete);

export default router;
