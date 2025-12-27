import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Calendar,
} from "lucide-react";
import clsx from "clsx";

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className={clsx("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-3xl font-bold text-white">{value}</span>
    </div>
    <h3 className="text-slate-400 font-medium">{title}</h3>
    {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
  </div>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeRequests: 0,
    pendingRequests: 0,
    completedToday: 0,
  });
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipment, requests] = await Promise.all([
          api.equipment.getAll(),
          api.maintenance.getRequests(),
        ]);

        // Calculate Stats
        setStats({
          totalEquipment: equipment.length,
          activeRequests: requests.filter((r) =>
            ["NEW", "IN_PROGRESS"].includes(r.status)
          ).length,
          pendingRequests: requests.filter((r) => r.status === "NEW").length,
          completedToday: requests.filter((r) => r.status === "REPAIRED")
            .length,
        });

        // Filter tasks for the logged-in technician
        if (user.role === "TECHNICIAN") {
          const tasks = requests.filter(
            (r) => r.assignedTo === user.name && r.status !== "REPAIRED"
          );
          setMyTasks(tasks);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
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
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-slate-400">Here's what's happening today.</p>
      </div>

      {/* Stats Row - Visible to Everyone */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Equipment"
          value={stats.totalEquipment}
          icon={Activity}
          color="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Active Requests"
          value={stats.activeRequests}
          icon={Wrench}
          color="bg-orange-500/10 text-orange-500"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingRequests}
          icon={Clock}
          color="bg-yellow-500/10 text-yellow-500"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle2}
          color="bg-green-500/10 text-green-500"
        />
      </div>

      {/* Technician Specific View */}
      {user.role === "TECHNICIAN" && (
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
      )}

      {/* Recent Activity for Admin/Manager */}
      {["ADMIN", "MANAGER"].includes(user.role) && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">System Overview</h2>
          <div className="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            Chart Placeholder (Activity over time)
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
