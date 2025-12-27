import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import Loader from "../../../components/common/Loader";
import { ClipboardList, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await api.maintenance.getRequests();
        const myReqs = requests.filter(
          (r) => r.reportedBy === (user.full_name || user.name)
        );
        setMyRequests(myReqs);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Employee Dashboard
          </h1>
          <p className="text-slate-400">Track your maintenance requests.</p>
        </div>
        <Link
          to="/requests/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Request
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-500" />
          My Recent Requests
        </h2>

        {myRequests.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>You haven't submitted any requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.slice(0, 5).map((req) => (
              <div
                key={req.id}
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-white font-medium">{req.subject}</h3>
                  <p className="text-slate-400 text-sm">{req.equipmentName}</p>
                </div>
                <div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                    {req.status}
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

export default EmployeeDashboard;
