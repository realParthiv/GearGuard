import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../../../../services/api";
import Modal from "../../../../components/common/Modal";
import { Loader2, AlertTriangle, Calendar } from "lucide-react";
import clsx from "clsx";

// --- Create Technician Modal ---
export const CreateTechnicianModal = ({ isOpen, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.employees.create({ ...data, role: "TECHNICIAN" }); // Role hardcoded for this specific modal or dynamic? User said "Employee/Technician API"
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to create technician:", error);
      // Extract specific error message from backend response if available
      const backendError = error.response?.data?.error || error.response?.data?.message || JSON.stringify(error.response?.data);
      alert(backendError || error.message || "Failed to create technician");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Technician">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Full Name
          </label>
          <input
            {...register("full_name", { required: "Name is required" })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            type="password"
            {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 chars" } })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500"
            placeholder="******"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
          <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Technician
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- Create Team Modal ---
export const CreateTeamModal = ({ isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isOpen) {
      api.employees.getAll().then(setEmployees).catch(console.error);
    }
  }, [isOpen]);

  const technicians = employees.filter(e => e.role === "TECHNICIAN");

  const onSubmit = async (data) => {
    try {
        // Transform members to array of integers
        const members = data.members ? data.members.map(id => parseInt(id)) : [];
        await api.teams.create({ ...data, members });
        reset();
        onSuccess();
        onClose();
    } catch (error) {
       console.error("Failed to create team:", error);
       alert(error.message || "Failed to create team");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Team">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Team Name</label>
          <input
            {...register("name", { required: "Team Name is required" })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            placeholder="Electrical Team Alpha"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Select Members (Technicians)</label>
          <select
            multiple
            {...register("members")}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white h-32"
          >
             {technicians.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.email})</option>
             ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</p>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
          <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Team
          </button>
        </div>
      </form>
    </Modal>
  );
};

// --- View Technicians Modal ---
export const ViewTechniciansModal = ({ isOpen, onClose }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.employees.getAll()
                .then(data => {
                    const techs = data.filter(e => e.role === "TECHNICIAN");
                    setTechnicians(techs);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Technician List">
            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : technicians.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No technicians found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800 text-xs uppercase text-slate-300">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">ID</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3 rounded-tr-lg">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {technicians.map(tech => (
                                <tr key={tech.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="px-4 py-3">{tech.id}</td>
                                    <td className="px-4 py-3 font-medium text-white">{tech.full_name}</td>
                                    <td className="px-4 py-3">{tech.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             <div className="flex justify-end mt-4">
                <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
                    Close
                </button>
            </div>
        </Modal>
    );
};

// --- Create Equipment Modal ---
export const CreateEquipmentModal = ({ isOpen, onClose, onSuccess }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  
  const onSubmit = async (data) => {
    try {
        await api.equipment.create({
            ...data, 
            maintenance_team: data.maintenance_team ? parseInt(data.maintenance_team) : null
        });
        reset();
        onSuccess();
        onClose();
    } catch (error) {
        console.error("Failed to create equipment:", error);
        alert(error.message || "Failed to create equipment");
    }
  };

  // Fetch teams for assignment
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    console.log("CreateEquipmentModal effect. Open:", isOpen);
    if(isOpen) {
        api.teams.getAll().then(data => {
            console.log("Fetched teams:", data);
            setTeams(data);
        }).catch(err => console.error("Failed teams fetch:", err));
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Equipment">
       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input {...register("name", { required: true })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Serial Number</label>
                <input {...register("serial_number", { required: true })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Department</label>
                <input {...register("department")} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                <input {...register("location")} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
            </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-300 mb-1">Maintenance Team</label>
            <select {...register("maintenance_team")} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white">
                <option value="">None</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Equipment
            </button>
        </div>
       </form>
    </Modal>
  );
};

// --- Create Request Modal ---
export const CreateRequestModal = ({ isOpen, onClose, onSuccess }) => {
    const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { request_type: "CORRECTIVE" } // updated to match API (request_type)
    });
    const requestType = watch("request_type");
    const [equipmentList, setEquipmentList] = useState([]);

    useEffect(() => {
        if(isOpen) {
            api.equipment.getAll().then(setEquipmentList).catch(console.error);
        }
    }, [isOpen]);

    const onSubmit = async (data) => {
        try {
            await api.maintenance.createRequest({
                ...data,
                equipment: parseInt(data.equipment)
            });
            reset();
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to create request:", error);
            alert(error.message || "Failed");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Maintenance Request">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <label className={clsx("cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-1", requestType === "CORRECTIVE" ? "bg-red-500/10 border-red-500 text-red-500" : "bg-slate-800 border-slate-700 text-slate-400")}>
                        <input type="radio" value="CORRECTIVE" {...register("request_type")} className="hidden" />
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm font-medium">Corrective</span>
                    </label>
                    <label className={clsx("cursor-pointer border rounded-lg p-3 flex flex-col items-center gap-1", requestType === "PREVENTIVE" ? "bg-blue-500/10 border-blue-500 text-blue-500" : "bg-slate-800 border-slate-700 text-slate-400")}>
                        <input type="radio" value="PREVENTIVE" {...register("request_type")} className="hidden" />
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm font-medium">Preventive</span>
                    </label>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                    <input {...register("subject", { required: true })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea {...register("description", { required: true })} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                    <select {...register("equipment", { required: true })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white">
                        <option value="">Select Equipment</option>
                        {equipmentList.map(e => <option key={e.id} value={e.id}>{e.name} - {e.serial_number}</option>)}
                    </select>
                 </div>

                 {requestType === "PREVENTIVE" && (
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Scheduled Date</label>
                        <input type="date" {...register("scheduled_date", { required: true })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white" />
                     </div>
                 )}

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                    <button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit Request
                    </button>
                </div>
            </form>
        </Modal>
    );
};
