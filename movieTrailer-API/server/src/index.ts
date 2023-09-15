import express from "express";
import bodyParser from "body-parser";
import movieRouter from "./routers/movieRouter.js";
import cors from "cors";
import fileUpload from "express-fileupload";
import mongoose from "mongoose";
import dotenv from "dotenv";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./routers/authRoutes.js";

// App creation
const app = express();

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 7009;

app.use(
  cors({
    origin: "*",
  })
);

// Request body recognition
app.use(bodyParser.json());

app.use(express.static("static"));

app.use(fileUpload());

// Import authorization routes
app.use("/api", movieRouter);

// Import device routes
app.use("/auth", authRoutes);

// The data format
app.use(express.json());

app.use(errorMiddleware);

const startApp = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGO_URI);
    console.log("Successfully connected to db");
    // Start server
    app.listen(PORT, () => {
      if (process.env.NODE_ENV === "prod") {
        console.log(`Server is running in production mode on port ${PORT}`);
      } else {
        console.log(`Server is running in development mode on port ${PORT}`);
      }
    });
  } catch (err) {
    console.log("Error connecting to database", err);
  }
};
startApp();
