import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import Loader from "../../../components/common/Loader";
import { Wrench, AlertTriangle, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await api.maintenance.getRequests();
        const tasks = requests.filter(
          (r) =>
            r.assignedTo === (user.full_name || user.name) &&
            r.status !== "REPAIRED"
        );
        setMyTasks(tasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Technician Dashboard
        </h1>
        <p className="text-slate-400">Your assigned maintenance tasks.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500" />
          My Assigned Tasks
        </h2>

        {myTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No active tasks assigned to you.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={clsx(
                      "p-2 rounded-lg",
                      task.priority === "CRITICAL"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-blue-500/10 text-blue-500"
                    )}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{task.subject}</h3>
                    <p className="text-slate-400 text-sm">
                      {task.equipmentName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={clsx(
                      "text-xs font-bold px-2 py-1 rounded border",
                      task.status === "IN_PROGRESS"
                        ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/5"
                        : "text-blue-400 border-blue-400/20 bg-blue-400/5"
                    )}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
