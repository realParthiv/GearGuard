import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import Loader from "../../../components/common/Loader";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlayCircle,
  CheckCheck,
  Trash2,
  Timer
} from "lucide-react";
import clsx from "clsx";

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingTask, setProcessingTask] = useState(null);

  const fetchTasks = async () => {
    try {
      // Use the new my_tasks endpoint
      const tasks = await api.maintenance.getMyTasks();

      // Filter for tasks assigned to the current user and not yet repaired/scrapped
      const userTasks = tasks.filter(
        (r) =>
          r.assignedTo === (user.full_name || user.name) &&
          !["REPAIRED", "SCRAP"].includes(r.status)
      );

      setMyTasks(userTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const handleStartTask = async (taskId) => {
    setProcessingTask(taskId);
    try {
      await api.maintenance.updateStatus(taskId, { status: "IN_PROGRESS" });
      await fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Failed to start task:", error);
      alert("Failed to update task status. Please try again.");
    } finally {
      setProcessingTask(null);
    }
  };

  const handleCompleteTask = async (taskId) => {
    const durationHours = prompt("Enter hours spent on this task:", "1.5");
    if (!durationHours) return;

    setProcessingTask(taskId);
    try {
      await api.maintenance.updateStatus(taskId, {
        status: "REPAIRED",
        duration_hours: parseFloat(durationHours),
      });
      await fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Failed to complete task:", error);
      alert("Failed to mark task as repaired. Please try again.");
    } finally {
      setProcessingTask(null);
    }
  };

  const handleScrapTask = async (taskId) => {
    if (!confirm("Are you sure you want to mark this as SCRAP? This will mark the equipment as unusable.")) {
      return;
    }

    setProcessingTask(taskId);
    try {
      await api.maintenance.updateStatus(taskId, { status: "SCRAP" });
      await fetchTasks(); // Refresh task list
    } catch (error) {
      console.error("Failed to scrap task:", error);
      alert("Failed to mark task as scrap. Please try again.");
    } finally {
      setProcessingTask(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "NEW":
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
      default:
        return "bg-green-500/10 text-green-400 border-green-500/30";
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-500" />
            My Tasks
          </h1>
          <p className="text-slate-400">
            Manage your assigned maintenance tasks
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-4 text-center">
          <div className="text-3xl font-bold text-white">{myTasks.length}</div>
          <div className="text-sm text-slate-400">Active Tasks</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <span className="text-slate-400 text-sm font-medium">New</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {myTasks.filter((t) => t.status === "NEW").length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <PlayCircle className="w-5 h-5 text-blue-500" />
            <span className="text-slate-400 text-sm font-medium">In Progress</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {myTasks.filter((t) => t.status === "IN_PROGRESS").length}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-slate-400 text-sm font-medium">Critical</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {myTasks.filter((t) => t.priority === "CRITICAL").length}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {myTasks.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <h3 className="text-xl font-semibold text-white mb-2">
              All Caught Up!
            </h3>
            <p className="text-slate-400">
              You have no active tasks assigned to you.
            </p>
          </div>
        ) : (
          myTasks.map((task) => (
            <div
              key={task.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={clsx(
                        "text-xs font-bold px-2.5 py-1 rounded-md border",
                        getPriorityColor(task.priority)
                      )}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={clsx(
                        "text-xs font-bold px-2.5 py-1 rounded-md border",
                        getStatusColor(task.status)
                      )}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-500">#{task.id}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {task.subject}
                  </h3>
                  <p className="text-slate-400 text-sm mb-3">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      <span>{task.equipmentName}</span>
                    </div>
                    {task.type && (
                      <div className="flex items-center gap-2">
                        {task.type === "CORRECTIVE" ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Timer className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="capitalize">
                          {task.type.toLowerCase()}
                        </span>
                      </div>
                    )}
                    {task.createdDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{task.createdDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-6">
                  {task.status === "NEW" && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      disabled={processingTask === task.id}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {processingTask === task.id ? "Starting..." : "Start Task"}
                    </button>
                  )}
                  {task.status === "IN_PROGRESS" && (
                    <>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={processingTask === task.id}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCheck className="w-4 h-4" />
                        {processingTask === task.id ? "Completing..." : "Complete"}
                      </button>
                      <button
                        onClick={() => handleScrapTask(task.id)}
                        disabled={processingTask === task.id}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        {processingTask === task.id ? "Scrapping..." : "Scrap"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
