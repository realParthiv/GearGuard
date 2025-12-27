import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import Loader from "../../../components/common/Loader";
import { Wrench, Clock, Activity, CheckCircle2 } from "lucide-react";
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

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeRequests: 0,
    pendingRequests: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipment, requests] = await Promise.all([
          api.equipment.getAll(),
          api.maintenance.getRequests(),
        ]);

        setStats({
          totalEquipment: equipment.length,
          activeRequests: requests.filter((r) =>
            ["NEW", "IN_PROGRESS"].includes(r.status)
          ).length,
          pendingRequests: requests.filter((r) => r.status === "NEW").length,
          completedToday: requests.filter((r) => r.status === "REPAIRED")
            .length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Manager Dashboard
        </h1>
        <p className="text-slate-400">Overview of maintenance operations.</p>
      </div>

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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">System Overview</h2>
        <div className="h-64 flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
          Chart Placeholder (Activity over time)
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
