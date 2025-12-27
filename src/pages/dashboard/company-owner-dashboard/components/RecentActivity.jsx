import React, { useEffect, useState } from "react";
import { Clock, AlertCircle, CheckCircle, Timer } from "lucide-react";
import maintenanceService from "../../../../services/maintenanceService";
import { format } from "date-fns";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        // Fetch latest 5 requests
        const data = await maintenanceService.getRequests({ limit: 5 });
        setActivities(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Timer className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading activity...</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        Recent Activity
      </h3>
      <div className="space-y-6">
        {activities.length === 0 ? (
          <p className="text-slate-500 text-sm">No recent activity.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-4 relative group">
              {/* Timeline line */}
              <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-slate-800 group-last:hidden"></div>

              <div className="relative z-10 bg-slate-900">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                  {getStatusIcon(activity.status)}
                </div>
              </div>

              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-white font-medium text-sm">
                    {activity.title || "Maintenance Request"}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {activity.created_at
                      ? format(new Date(activity.created_at), "MMM d, h:mm a")
                      : "Just now"}
                  </span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-1">
                  {activity.description || "No description provided."}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {activity.priority}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {activity.equipment_name || "Equipment"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
