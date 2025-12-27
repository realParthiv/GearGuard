import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import {
  ArrowLeft,
  Wrench,
  Calendar,
  Activity,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eqData, reqData] = await Promise.all([
          api.equipment.getById(id),
          api.maintenance.getRequests(),
        ]);
        setEquipment(eqData);
        // Filter requests for this equipment
        setRequests(reqData.filter((r) => r.equipmentId === parseInt(id)));
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Loader />;
  if (!equipment) return <div className="text-white">Equipment not found</div>;

  const activeRequests = requests.filter((r) =>
    ["NEW", "IN_PROGRESS"].includes(r.status)
  );

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Equipment
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
            <div className="h-64 relative">
              <img
                src={equipment.image}
                alt={equipment.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {equipment.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border",
                      equipment.status === "OPERATIONAL"
                        ? "text-green-500 bg-green-500/10 border-green-500/20"
                        : equipment.status === "MAINTENANCE"
                        ? "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
                        : "text-red-500 bg-red-500/10 border-red-500/20"
                    )}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {equipment.status}
                  </span>
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    {equipment.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Specifications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    Model Number
                  </p>
                  <p className="text-white font-mono">XJ-2000-V2</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    Serial Number
                  </p>
                  <p className="text-white font-mono">SN-8842-991</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    Installation Date
                  </p>
                  <p className="text-white">Jan 15, 2022</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    Manufacturer
                  </p>
                  <p className="text-white">Industrial Corp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance History */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {requests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-800/50"
                >
                  <div
                    className={clsx(
                      "p-2 rounded-lg",
                      req.type === "CORRECTIVE"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-blue-500/10 text-blue-500"
                    )}
                  >
                    {req.type === "CORRECTIVE" ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-white font-medium">{req.subject}</h4>
                      <span className="text-xs text-slate-500">
                        {req.createdDate}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {req.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={clsx(
                          "text-xs px-2 py-0.5 rounded border",
                          req.status === "REPAIRED"
                            ? "text-green-400 border-green-400/20 bg-green-400/5"
                            : "text-yellow-400 border-yellow-400/20 bg-yellow-400/5"
                        )}
                      >
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Assigned to: {req.assignedTo || "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>

            <button
              onClick={() =>
                navigate("/requests/new", {
                  state: {
                    equipmentId: equipment.id,
                    equipmentName: equipment.name,
                  },
                })
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl flex items-center justify-between group transition-all mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Wrench className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Request Maintenance</p>
                  <p className="text-xs text-blue-200">Report an issue</p>
                </div>
              </div>
              {activeRequests.length > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {activeRequests.length} Active
                </div>
              )}
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-4 rounded-xl flex items-center gap-3 transition-all border border-slate-700">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Schedule Preventive</span>
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              Status Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Uptime (30d)</span>
                <span className="text-green-400 font-mono">98.5%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[98.5%]" />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-400 text-sm">MTBF</span>
                <span className="text-white font-mono">450 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">MTTR</span>
                <span className="text-white font-mono">2.5 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
