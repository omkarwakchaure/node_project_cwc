import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(
  //allowing cross-origin requests and cookies
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" })); //accessing json data
app.use(express.urlencoded({ limit: "16kb", extended: true })); //accessing url data
app.use(express.static("public")); //accessing static files
app.use(cookieParser()); //accessing cookies

//routes import
import userRouter from "./routes/user.routes.js";
//routes declaration
app.use("/api/v1/users", userRouter);

export { app };
