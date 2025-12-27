import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Calendar,
  KanbanSquare,
  LogOut,
} from "lucide-react";
import clsx from "clsx";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const links = [
    {
      to: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "MANAGER", "TECHNICIAN", "USER"],
    },
    {
      to: "/equipment",
      label: "Equipment",
      icon: Wrench,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      to: "/requests",
      label: "Requests",
      icon: ClipboardList,
      roles: ["ADMIN", "MANAGER", "USER"],
    },
    {
      to: "/kanban",
      label: "Kanban Board",
      icon: KanbanSquare,
      roles: ["ADMIN", "TECHNICIAN", "MANAGER"],
    },
    {
      to: "/calendar",
      label: "Calendar",
      icon: Calendar,
      roles: ["ADMIN", "MANAGER", "TECHNICIAN"],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user?.role));

  return (
    <div className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          GearGuard
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <img
            src={
              user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`
            }
            alt="Profile"
            className="w-10 h-10 rounded-full bg-slate-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 truncate capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
