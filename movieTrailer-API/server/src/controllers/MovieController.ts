import { Request, Response, NextFunction } from "express";
import IMovie from "../interfaces/MovieInterface.js";
import MovieService from "../services/MovieService.js";
import ApiError from "../utils/ApiError.js";
import AuthService from "../services/AuthService.js";
import IUser from "../interfaces/UserInterface.js";
import MovieModel from "../models/MovieModel.js";
import RatingModel from "../models/RatingModel.js";
import IRating from "../interfaces/RatingInterface.js";

class MovieController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, releaseDate, trailerLink, genres } = req.body;

      const poster = req.files?.posterUrl;

      let posterImage = "no-image.jpg";

      if (poster) {
        posterImage = await MovieService.save(poster);
      }

      const newMovie = {
        title,
        releaseDate,
        trailerLink,
        posterUrl: posterImage,
        genres,
      } as IMovie;

      const savedMovie = await MovieService.createMovie(newMovie);

      res.status(201).json(savedMovie);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "releaseDate";
      const sortOrder = (req.query.sortOrder as string) || "desc";
      const filtersQuery = req.query.filters as string | undefined;

      let filters: any = {};

      if (filtersQuery) {
        try {
          filters = JSON.parse(decodeURIComponent(filtersQuery));
        } catch (error) {
          return next(ApiError.BadRequestError("Invalid filters JSON"));
        }
      }

      const movies = await MovieService.getAllMovies(
        page,
        limit,
        sortBy,
        sortOrder,
        filters
      );

      res.json(movies);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const movie = await MovieService.getMovieById(id);
      console.log(movie);

      if (!movie) {
        throw ApiError.NotFoundError(`Novie not found for ${id}`);
      }

      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const { title, releaseDate, trailerLink, genres } = req.body;

      const poster = req.files?.posterUrl;

      let posterImage = "no-image.jpg";

      const movieData = {
        title,
        releaseDate,
        trailerLink,
        posterUrl: posterImage,
        genres,
      } as IMovie;

      let existingMovie: IMovie | null = await MovieService.updateMovie(
        id,
        movieData
      );

      if (!existingMovie) {
        throw ApiError.NotFoundError(`Movie not found fot ${id}`);
      }

      if (existingMovie) {
        if (
          existingMovie.posterUrl &&
          existingMovie.posterUrl !== "no-image.jpg"
        ) {
          await MovieService.deleteMovie(existingMovie.posterUrl);
        }

        if (poster) {
          posterImage = await MovieService.save(poster);
        }

        existingMovie.title = title || existingMovie.title;
        existingMovie.releaseDate = releaseDate || existingMovie.releaseDate;
        existingMovie.trailerLink = trailerLink || existingMovie.trailerLink;
        existingMovie.posterUrl = posterImage || existingMovie.posterUrl;

        const updatedMovie = await existingMovie.save();
        res.json(updatedMovie);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const movieID = req.params.id;

      if (!AuthService.isAdmin(req.user as IUser)) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const deletedMovie = await MovieModel.findByIdAndDelete(movieID);

      if (!deletedMovie) {
        res.status(404).json({ error: "Movie not found" });
      }

      res.json(deletedMovie);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .send({ errorMessage: "Failed to delete movie", error: err });
    }
  }

  async createRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { movieId, userId, rating, comment } = req.body;

      const newRating = new RatingModel({
        movie: movieId,
        user: userId,
        rating,
        comment,
      }) as IRating;

      const savedRating = await MovieService.createRating(newRating);

      res.status(201).json(savedRating);
    } catch (error) {
      next(error);
    }
  }
}

export default new MovieController();
