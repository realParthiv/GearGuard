import React, { useState } from "react";
import { UserCog, Search, Mail, Phone } from "lucide-react";

const EmployeesTab = ({ employees }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCog className="w-5 h-5 text-blue-500" />
          Employees List
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64"
            />
          </div>
          {/* Add Employee Button can be added here if needed */}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Contact</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              {/* <th className="px-6 py-4 font-medium text-right">Actions</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              employees
                .filter(
                  (e) =>
                    e.full_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    e.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((employee) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                          {employee.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {employee.full_name}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {employee.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Mail className="w-3 h-3" />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Phone className="w-3 h-3" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        {employee.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {employee.joinedDate || "N/A"}
                    </td>
                    {/* Actions column can be added here */}
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeesTab;
