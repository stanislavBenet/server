import bodyParser from "body-parser";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import { createPost } from "./controllers/postController.js";

import { register } from "./controllers/authController.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import User from "./models/User.js";
import Post from "./models/Post.js";

import { users, posts } from "./data/index.js";
/* CONFIGURATIONS */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// get access to environment variables
dotenv.config();

//get access to express framework for interacting with it
const app = express();

//parses recieved JSON data to JS object which appears in req.body
app.use(express.json());

// https://www.npmjs.com/package/helmet
// https://my-js.org/docs/cheatsheet/helmet/
// secure the app by setting various HTTP headers.
app.use(helmet());

//The crossOriginResourcePolicy setting is specifically
//for configuring how cross - origin requests are handled.
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

//uses Morgan to log HTTP requests in the 'common' format.
app.use(morgan("common"));

// is a bit redundant here since express.json() is already used, but if used, it sets up
// the body - parser to accept JSON payloads up to 30mb in size.
app.use(bodyParser.json({ limit: "30mb", extended: true }));

//allows the server to accept requests from different origins.
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

//File storage*
// saving files:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

//
const upload = multer({ storage });

/**Routes with files */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
// mongoose setup

const PORT = process.env.PORT || 3002;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server has been started on ${PORT}`));
    /*  User.insertMany(users);
    Post.insertMany(posts);  */
  })
  .catch((error) => console.log(`${error.message} happened`));



export default app;