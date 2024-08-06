import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose.connect("mongodb+srv://karannegi10:Gautamn49@projects.67269bl.mongodb.net/TaskManager");

    console.log("DB connection established");
  } catch (error) {
    console.log("DB Error: " + error);
  }
};

export const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Change sameSite from strict to none when you deploy your app
  res.cookie('token', token, {
    httpOnly: true, // Ensures the cookie is only accessible via HTTP(S), not JavaScript
    secure: false,  // Only use 'true' in production over HTTPS
    sameSite: 'None', // 'None' for cross-site cookies, 'Lax' or 'Strict' otherwise
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time in milliseconds (24 hours)
  });
  return token;
};
