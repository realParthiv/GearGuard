import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import Loader from "../../../components/common/Loader";
import { Wrench, Clock, Activity, CheckCircle2, UserPlus, Users, PackagePlus, FilePlus, UserCog } from "lucide-react";
import clsx from "clsx";
import {
  CreateTechnicianModal,
  CreateTeamModal,
  CreateEquipmentModal,
  CreateRequestModal,
  ViewTechniciansModal
} from "./modals/CreateEntityModals";

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

  // Modal States
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isViewTechModalOpen, setIsViewTechModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [equipment, requests] = await Promise.all([
        api.equipment.getAll(),
        api.maintenance.getRequests(),
      ]);

      const today = new Date().toISOString().split("T")[0];

      setStats({
        totalEquipment: equipment.length,
        activeRequests: requests.filter((r) =>
          ["NEW", "IN_PROGRESS"].includes(r.status)
        ).length,
        pendingRequests: requests.filter((r) => r.status === "NEW").length,
        completedToday: requests.filter((r) => 
            r.status === "REPAIRED" && 
            (r.completedDate === today || r.updated_at?.startsWith(today)) // Handling varied date formats if any
        ).length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">
            Manager Dashboard
            </h1>
            <p className="text-slate-400">Overview of maintenance operations.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
            <button
                onClick={() => setIsViewTechModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700"
                title="View Technicians"
            >
                <UserCog className="w-5 h-5" />
            </button>
            <button
                onClick={() => { console.log("Open Tech Modal"); setIsTechModalOpen(true); }}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700"
                title="Add Technician"
            >
                <UserPlus className="w-5 h-5" />
            </button>
            <button
                onClick={() => { console.log("Open Team Modal"); setIsTeamModalOpen(true); }}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700"
                title="Create Team"
            >
                <Users className="w-5 h-5" />
            </button>
             <button
                onClick={() => { console.log("Open Equipment Modal"); setIsEquipmentModalOpen(true); }}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700"
                title="Add Equipment"
            >
                <PackagePlus className="w-5 h-5" />
            </button>
             <button
                onClick={() => { console.log("Open Request Modal"); setIsRequestModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                title="New Request"
            >
                <FilePlus className="w-5 h-5" />
            </button>
        </div>
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

      {/* Modals */}
      <ViewTechniciansModal 
        isOpen={isViewTechModalOpen} 
        onClose={() => setIsViewTechModalOpen(false)} 
      />
      <CreateTechnicianModal 
        isOpen={isTechModalOpen} 
        onClose={() => setIsTechModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <CreateTeamModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <CreateEquipmentModal 
        isOpen={isEquipmentModalOpen} 
        onClose={() => setIsEquipmentModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <CreateRequestModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
};

export default ManagerDashboard;
