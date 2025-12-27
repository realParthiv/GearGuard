import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Shield,
  LayoutDashboard,
  UserCog,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import userService from "../../../services/userService";
import axiosInstance from "../../../services/axiosConfig";
import { ENDPOINTS } from "../../../services/endpoints";
import { toast } from "react-toastify";
import Loader from "../../../components/common/Loader";
import clsx from "clsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const CompanyOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "managers") {
        const data = await userService.getManagers();
        setManagers(Array.isArray(data) ? data : []);
      } else if (activeTab === "overview") {
        const response = await axiosInstance.get(ENDPOINTS.MAINTENANCE.STATS);
        setStats(response.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // toast.error("Failed to fetch data"); // Optional: suppress if not critical
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingManager) {
        await userService.updateManager(editingManager.id, formData);
        toast.success("Manager updated successfully");
      } else {
        await userService.createManager(formData);
        toast.success("Manager created successfully");
      }
      fetchData();
      resetForm();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      full_name: manager.full_name,
      email: manager.email,
      phone: manager.phone,
      password: "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this manager?")) {
      try {
        await userService.deleteManager(id);
        toast.success("Manager deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete manager");
      }
    }
  };

  const resetForm = () => {
    setFormData({ full_name: "", email: "", phone: "", password: "" });
    setEditingManager(null);
    setShowForm(false);
  };

  const filteredManagers = managers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderOverview = () => {
    if (!stats) return <div className="text-white">Loading stats...</div>;

    // Transform data for charts if necessary
    // Assuming stats has 'requests_by_status' and 'requests_by_priority' or similar
    // If structure is unknown, we will try to map it generically or check console logs.
    // Based on standard patterns:
    const statusData = stats.requests_by_status || [];
    const priorityData = stats.requests_by_priority || [];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-sm mb-1">Total Requests</h3>
            <p className="text-3xl font-bold text-white">
              {stats.total_requests || 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-sm mb-1">Total Equipment</h3>
            <p className="text-3xl font-bold text-white">
              {stats.total_equipment || 0}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-slate-400 text-sm mb-1">Pending Requests</h3>
            <p className="text-3xl font-bold text-white">
              {stats.pending_requests || 0}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-500" />
              Requests by Status
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Requests by Priority
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="priority" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      color: "#fff",
                    }}
                    cursor={{ fill: "#334155", opacity: 0.2 }}
                  />
                  <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderManagers = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Managers List
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search managers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Manager
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredManagers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No managers found.
                </td>
              </tr>
            ) : (
              filteredManagers.map((manager) => (
                <tr
                  key={manager.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {manager.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {manager.full_name}
                        </p>
                        <p className="text-slate-500 text-xs">{manager.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Mail className="w-3 h-3" />
                        {manager.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Phone className="w-3 h-3" />
                        {manager.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                      {manager.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {manager.joinedDate || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(manager)}
                        className="p-2 hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(manager.id)}
                        className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-6">
      {/* Internal Sidebar */}
      <div className="w-64 bg-slate-900 border border-slate-800 rounded-2xl p-4 h-full flex flex-col">
        <div className="mb-6 px-2">
          <h2 className="text-lg font-bold text-white">Company Admin</h2>
          <p className="text-xs text-slate-500">Manage your organization</p>
        </div>
        <nav className="space-y-1 flex-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              activeTab === "overview"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("managers")}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              activeTab === "managers"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Users className="w-4 h-4" />
            Managers
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
              activeTab === "employees"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <UserCog className="w-4 h-4" />
            Employees
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2">
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

        {activeTab === "overview" && renderOverview()}
        {activeTab === "managers" && renderManagers()}
        {activeTab === "employees" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <UserCog className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
            <p className="text-slate-500">
              Employee management module is under development.
            </p>
          </div>
        )}
      </div>

      {/* Modal Form (Only for Managers tab for now) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingManager ? "Edit Manager" : "Add New Manager"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="manager@gearguard.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 234 567 890"
                />
              </div>
              {!editingManager && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {editingManager ? "Update Manager" : "Create Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyOwnerDashboard;
