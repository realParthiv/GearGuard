import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await api.equipment.getAll();
        setEquipment(data);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "OPERATIONAL":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "MAINTENANCE":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "SCRAP":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-800 border-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "OPERATIONAL":
        return CheckCircle2;
      case "MAINTENANCE":
        return AlertCircle;
      case "SCRAP":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const filteredEquipment = equipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Equipment</h1>
          <p className="text-slate-400">
            Manage and monitor all machinery assets
          </p>
        </div>
        {["ADMIN", "MANAGER"].includes(user?.role) && (
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 hover:text-white hover:border-slate-600 flex items-center gap-2 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          return (
            <Link
              to={`/equipment/${item.id}`}
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 to-transparent opacity-60" />
                <div
                  className={clsx(
                    "absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-md",
                    getStatusColor(item.status)
                  )}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {item.status}
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h3>
                  <button className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-slate-400 text-sm mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  {item.location}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-500">
                    Last Maintenance
                    <p className="text-slate-300 font-medium mt-0.5">
                      {item.lastMaintenance}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500 text-right">
                    Next Due
                    <p className="text-slate-300 font-medium mt-0.5">
                      In 14 days
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentList;
