import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

export const createTask = async (req, res) => {
  try {
    // console.log('User ID:', req.user.userId, '\n');
    // console.log('Request Body:', req.body);

    const { userId } = req.user;
    const { title, team, stage, date, priority, assets } = req.body;

    let text = "New task has been assigned to you";
    if (team?.length > 1) {
      text = text + ` and ${team?.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${priority} priority, so check and act accordingly. The task date is ${new Date(
        date
      ).toDateString()}. Thank you!!!`;

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
    });

    console.log('Task Created:', task);

    await Notice.create({
      team,
      text,
      task: task._id,
    });

    res
      .status(200)
      .json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Duplicate",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    //alert users of the task
    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Activity posted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    console.log(userId, isAdmin);

    const allTasks = isAdmin
      ? await Task.find({
          isTrashed: false,
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $all: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt")
      .limit(10)
      .sort({ _id: -1 });

    //   group task by stage and calculate counts
    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    // Group tasks by priority
    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // calculate total tasks
    const totalTasks = allTasks?.length;
    const last10Task = allTasks?.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    // Default to false if isTrashed is not provided or not a boolean value
    const isTrashedValue = isTrashed === 'true'; 

    // Build query based on parameters
    let query = { isTrashed: isTrashedValue };

    if (stage) {
      query.stage = stage;
    }

    // Fetch tasks with population and sorting
    const tasks = await Task.find(query)
      .populate({
        path: "team",
        select: "name title email", // Select only necessary fields
      })
      .sort({ _id: -1 }); // Sort tasks in descending order by _id

    // Send successful response
    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    // Log error and send error response
    console.error('Error fetching tasks:', error.message || error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while fetching tasks.',
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the provided task ID
    if (!id) {
      return res.status(400).json({ status: false, message: 'Task ID is required.' });
    }

    // Find the task by ID and populate related fields
    const task = await Task.findById(id)
      .populate({
        path: 'team', // Populating the team field
        select: 'name title role email' // Select specific fields to return
      })
      .populate({
        path: 'activities.by', // Populating the "by" field within activities
        select: 'name' // Select specific fields to return
      })
      .populate({
        path: 'subTasks', // Populate subTasks if you have a reference to them
        select: 'title status' // Adjust fields as necessary
      });

    // Check if the task exists
    if (!task) {
      return res.status(404).json({ status: false, message: 'Task not found.' });
    }

    // Send response with the task data
    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error); // Log the error for debugging
    return res.status(500).json({ status: false, message: 'An error occurred while retrieving the task.' });
  }
};

export const createSubTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body;

    const { id } = req.params;

    const newSubTask = {
      title,
      date,
      tag,
    };

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, priority, assets } = req.body;

    const task = await Task.findById(id);

    task.title = title;
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;
    task.stage = stage.toLowerCase();
    task.team = team;

    await task.save();

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

// export const deleteRestoreTask = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { actionType } = req.query;
//     if (actionType === "delete") {
//       await Task.findByIdAndDelete(id);
//     } else if (actionType === "deleteAll") {
//       await Task.deleteMany({ isTrashed: true });
//     } else if (actionType === "restore") {
//       const resp = await Task.findById(id);

//       resp.isTrashed = false;
//       resp.save();
//     } else if (actionType === "restoreAll") {
//       await Task.updateMany(
//         { isTrashed: true },
//         { $set: { isTrashed: false } }
//       );
//     }

//     res.status(200).json({
//       status: true,
//       message: `Operation performed successfully.`,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// };


export const deleteTask = async (req, res) => {
  const {id} = req.params; // Destructuring the id from req.params

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ success: true ,message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
