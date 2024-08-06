import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protectRoute = async (req, res, next) => {
  try {
    // Access cookies from the request
    const token = req.cookies.token;
    // console.log('Token: ', token);

    if (token) {
      // Verify the token (assuming you have a function to do so)
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // Retrieve user information from the database
      const resp = await User.findById(decodedToken.userId).select(
        "isAdmin email"
      );

      // Attach user information to the request object
      req.user = {
        email: resp.email,
        isAdmin: resp.isAdmin,
        userId: decodedToken.userId,
      };

      // Proceed to the next middleware or route handler
      next();
    } else {
      // No token present, return unauthorized status
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. Try login again." });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again." });
  }
};

const isAdminRoute = (req, res, next) => {
  // console.log(req.user);
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "Not authorized as admin. Try login as admin.",
    });
  }
};

export { isAdminRoute, protectRoute };
