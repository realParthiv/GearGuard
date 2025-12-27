import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import { Plus, AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const RequestsList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.maintenance.getRequests();
        if (user.role === "USER") {
          setRequests(
            data.filter(
              (req) => req.reportedBy === (user.full_name || user.name)
            )
          );
        } else {
          setRequests(data);
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "NEW":
        return "text-blue-400 border-blue-400/20 bg-blue-400/5";
      case "IN_PROGRESS":
        return "text-yellow-400 border-yellow-400/20 bg-yellow-400/5";
      case "REPAIRED":
        return "text-green-400 border-green-400/20 bg-green-400/5";
      default:
        return "text-slate-400 border-slate-400/20 bg-slate-400/5";
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Maintenance Requests
          </h1>
          <p className="text-slate-400">Track and manage repair jobs</p>
        </div>
        <Link
          to="/requests/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Request
        </Link>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            No requests found.
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div
                  className={clsx(
                    "p-3 rounded-xl self-start",
                    req.type === "CORRECTIVE"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                  )}
                >
                  {req.type === "CORRECTIVE" ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <Calendar className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span
                      className={clsx(
                        "text-xs font-bold px-2 py-1 rounded-md border",
                        getPriorityColor(req.priority)
                      )}
                    >
                      {req.priority}
                    </span>
                    <span className="text-slate-500 text-sm">#{req.id}</span>
                    <span className="text-slate-500 text-sm">•</span>
                    <span className="text-slate-400 text-sm font-medium">
                      {req.equipmentName}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {req.subject}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-1">
                    {req.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 md:border-l md:border-slate-800 md:pl-6">
                  <div className="text-right">
                    <div
                      className={clsx(
                        "text-xs font-medium px-2 py-1 rounded border inline-block mb-1",
                        getStatusColor(req.status)
                      )}
                    >
                      {req.status}
                    </div>
                    <p className="text-xs text-slate-500">
                      {req.assignedTo
                        ? `Tech: ${req.assignedTo}`
                        : "Unassigned"}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RequestsList;
