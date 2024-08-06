import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { errorHandler, routeNotFound } from "./middlewares/errorMiddlewaves.js";
import routes from "./routes/index.js";
import { dbConnection } from "./utils/index.js";
import User from "./models/user.js";

dotenv.config();

dbConnection();

// const user = await User.create({
//     name: "abc",
//     title: "TL",
//     role: "TL",
//     email: "abc@gmail.com",
//     password: "abc123",
//     isAdmin: true, // Corrected from True to true
//     tasks: [], // Assuming no tasks for the new user
//     isActive: true, // Corrected from True to true
//   });

// console.log(user)

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your front-end URL
    credentials: true // Allow cookies to be sent
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(morgan("dev"));
app.use("/api", routes);

app.use(routeNotFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
