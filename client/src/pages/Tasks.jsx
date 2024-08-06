import React, { useState, useEffect } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import AddSubTask from "../components/task/AddSubTask";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();
  const [selected, setSelected] = useState(0);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openSubTaskModal, setOpenSubTaskModal] = useState(false); // State for sub-task modal
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null); // State for selected task ID

  const status = params?.status || "";

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/task/", { withCredentials: true });

        if (response.data.status) {
          setTasks(response.data.tasks);
        } else {
          console.error("Failed to fetch tasks:", response.data.message);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskCreated = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/task/", { withCredentials: true });
      if (response.data.status) {
        setTasks(response.data.tasks);
      } else {
        console.error("Failed to refresh tasks:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    }
  };

  const handleSubTaskCreated = () => {
    handleTaskCreated(); // Refresh tasks when a sub-task is created
    setOpenSubTaskModal(false); // Close the sub-task modal
  };

  const handleOpenSubTaskModal = (taskId) => {
    setSelectedTaskId(taskId);
    setOpenSubTaskModal(true);
  };

  const filteredTasks = status ? tasks.filter(task => task.status === status) : tasks;

  return loading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={status ? `${status} Tasks` : "Tasks"} />

        {!status && (
          <Button
            onClick={() => setOpenTaskModal(true)}
            label="Create Task"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5"
          />
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
            <TaskTitle label="To Do" className={TASK_TYPE.todo} />
            <TaskTitle
              label="In Progress"
              className={TASK_TYPE["in progress"]}
            />
            <TaskTitle label="Completed" className={TASK_TYPE.completed} />
          </div>
        )}

        {selected !== 1 ? (
          <BoardView tasks={filteredTasks} onOpenSubTaskModal={handleOpenSubTaskModal} />
        ) : (
          <div className="w-full">
            <Table tasks={filteredTasks} onOpenSubTaskModal={handleOpenSubTaskModal} />
          </div>
        )}
      </Tabs>

      <AddTask open={openTaskModal} setOpen={setOpenTaskModal} onTaskCreated={handleTaskCreated} />
      <AddSubTask 
        open={openSubTaskModal} 
        setOpen={setOpenSubTaskModal} 
        id={selectedTaskId} 
        onTaskUpdated={handleSubTaskCreated} 
      />
    </div>
  );
};

export default Tasks;
