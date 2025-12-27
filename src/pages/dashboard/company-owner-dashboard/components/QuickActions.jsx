import React from "react";
import { Plus, FileText, Settings, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Add Manager",
      icon: UserPlus,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      onClick: () => navigate("/company-dashboard/managers"),
    },
    {
      label: "Add Employee",
      icon: UserPlus,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      onClick: () => navigate("/company-dashboard/employees"),
    },
    {
      label: "View Reports",
      icon: FileText,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      onClick: () => {}, // Placeholder
    },
    {
      label: "Settings",
      icon: Settings,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      onClick: () => {}, // Placeholder
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border ${action.border} ${action.bg} hover:bg-opacity-20 transition-all duration-200 group`}
          >
            <action.icon
              className={`w-6 h-6 ${action.color} mb-2 group-hover:scale-110 transition-transform`}
            />
            <span className="text-xs font-medium text-slate-300">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
