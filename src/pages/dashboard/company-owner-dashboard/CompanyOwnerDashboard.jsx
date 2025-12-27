import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import userService from "../../../services/userService";
import maintenanceService from "../../../services/maintenanceService";
import OverviewTab from "./components/OverviewTab";
import ManagersTab from "./components/ManagersTab";
import EmployeesTab from "./components/EmployeesTab";

const CompanyOwnerDashboard = () => {
  const [managers, setManagers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/managers")) return "managers";
    if (path.includes("/employees")) return "employees";
    return "overview";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    fetchData();
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const path = location.pathname;
      if (path.includes("/managers")) {
        const data = await userService.getManagers();
        setManagers(Array.isArray(data) ? data : []);
      } else if (path.includes("/employees")) {
        const data = await userService.getEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } else {
        // Default to overview
        const data = await maintenanceService.getStats();
        setStats(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 capitalize">
          {activeTab}
        </h1>
        <p className="text-slate-400">
          {activeTab === "overview" && "Company performance and statistics"}
          {activeTab === "managers" && "Manage your company managers"}
          {activeTab === "employees" && "Manage your technical staff"}
        </p>
      </div>

      {activeTab === "overview" && <OverviewTab stats={stats} />}

      {activeTab === "managers" && (
        <ManagersTab managers={managers} fetchData={fetchData} />
      )}

      {activeTab === "employees" && <EmployeesTab employees={employees} />}
    </div>
  );
};

export default CompanyOwnerDashboard;
