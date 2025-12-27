import React from "react";
import { LayoutDashboard, Users, ClipboardList, Wrench } from "lucide-react";

const StatsCards = ({ stats }) => {
  const { counters } = stats || {};

  const cards = [
    {
      title: "Total Equipment",
      value: counters?.total_equipment || 0,
      icon: Wrench,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Total Employees",
      value: counters?.total_employees || 0,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      title: "Total Teams",
      value: counters?.total_teams || 0,
      icon: LayoutDashboard,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      title: "Open Requests",
      value: counters?.open_requests || 0,
      icon: ClipboardList,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all duration-300 group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${card.bg} ${card.border} border`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-lg group-hover:bg-slate-700 transition-colors">
              +2.5%
            </span>
          </div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">
            {card.title}
          </h3>
          <p className="text-3xl font-bold text-white tracking-tight">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
