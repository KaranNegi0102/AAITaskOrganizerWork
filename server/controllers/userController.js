import { response } from "express";
import User from "../models/user.js";
import { createJWT } from "../utils/index.js";
import Notice from "../models/notification.js";
import Task from "../models/task.js";
import jwt from "jsonwebtoken";
import { user } from "../../client/src/assets/data.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, title, isAdmin } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      isAdmin,
      role,
      title,
    });

    console.log(user);
    

    if (user) {
      isAdmin ? createJWT(res, user._id) : null;

      user.password = undefined;

      res.status(201).json({user: user});
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      const token = createJWT(res, user._id);
      // console.log(token);

      user.password = undefined;

      // res.cookie('token', token, {
      //   httpOnly: true, // Ensures the cookie is only accessible via HTTP(S), not JavaScript
      //   secure: false,  // Only use 'true' in production over HTTPS
      //   sameSite: 'None', // 'None' for cross-site cookies, 'Lax' or 'Strict' otherwise
      //   maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time in milliseconds (24 hours)
      // });

      res.cookie("token", token);

      return res.status(200).json({ user });
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    console.log("kya yaha par error h ?");
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      htttpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful", user: null });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTeamList = async (req, res) => {
  try {
    const users = await User.find().select("-__v"); // Exclude the __v field if not needed
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getNotificationsList = async (req, res) => {
  try {
    const { userId } = req.user;

    const notice = await Notice.find({
      team: userId,
      isRead: { $nin: [userId] },
    }).populate("task", "title");

    res.status(201).json(notice);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { _id } = req.body;

    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
        ? _id
        : userId;

    const user = await User.findById(id);

    if (user) {
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: "Profile Updated Successfully.",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { userId } = req.user;

    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }

    res.status(201).json({ status: true, message: "Done" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.password;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: `Password chnaged successfully.`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      user.isActive = req.body.isActive; //!user.isActive

      await user.save();

      res.status(201).json({
        status: true,
        message: `User account has been ${
          user?.isActive ? "activated" : "disabled"
        }`,
      });
    } else {
      res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardData = async (req, res) => {
  try {
    // Get total number of tasks
    const totalTasks = await Task.countDocuments();

    // Get task counts by stage
    const completedTasks = await Task.countDocuments({ stage: "completed" });
    const inProgressTasks = await Task.countDocuments({ stage: "in progress" });
    const todoTasks = await Task.countDocuments({ stage: "todo" });

    // Get last 10 tasks
    const last10Tasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("team", "name role"); // Assuming team is an array of user IDs

    // Get all users
    const users = await User.find(); // Fetching all users
    console.log("Anurag");

    return res.json({
      totalTasks,
      tasks: {
        completed: completedTasks,
        "in progress": inProgressTasks,
        todo: todoTasks,
      },
      last10Tasks,
      users, // Including users in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// export const totalUsers = async(req, res) => {

//   try {
//     const users = await User.find();
//     console.log(users);

//     if(!users)
//     {
//       res.json({message: 'No Users found'})
//     }

//     return res.status(200).json({users})

//   } catch (error) {
//     res.send(error)
//   }
// }

export const getUserInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    // console.log(user);

    if (!user) {
      return res.status(401).json({ status: false, message: "User Not Found" });
    }

    res.status(200).json({ status: true, user });
  } catch (error) {
    res.error;
  }
};
