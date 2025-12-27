import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../../context/AuthContext";

const RequestForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      type: "CORRECTIVE",
      priority: "MEDIUM",
      equipmentId: location.state?.equipmentId || "",
    },
  });

  const [equipmentList, setEquipmentList] = useState([]);
  const requestType = watch("type");

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await api.equipment.getAll();
        setEquipmentList(data);
      } catch (error) {
        console.error("Failed to fetch equipment:", error);
      }
    };
    fetchEquipment();
  }, []);

  const onSubmit = async (data) => {
    try {
      const selectedEquipment = equipmentList.find(
        (e) => e.id === parseInt(data.equipmentId)
      );
      await api.maintenance.createRequest({
        ...data,
        equipmentName: selectedEquipment?.name,
        reportedBy: user.name,
      });
      navigate("/requests");
    } catch (error) {
      console.error("Failed to create request:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Cancel
      </button>

      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-6">
          New Maintenance Request
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <label
              className={clsx(
                "cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all",
                requestType === "CORRECTIVE"
                  ? "bg-red-500/10 border-red-500 text-red-500"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              )}
            >
              <input
                type="radio"
                value="CORRECTIVE"
                {...register("type")}
                className="hidden"
              />
              <AlertTriangle className="w-6 h-6" />
              <span className="font-medium">Corrective</span>
            </label>

            {["ADMIN", "MANAGER"].includes(user.role) && (
              <label
                className={clsx(
                  "cursor-pointer border rounded-xl p-4 flex flex-col items-center gap-2 transition-all",
                  requestType === "PREVENTIVE"
                    ? "bg-blue-500/10 border-blue-500 text-blue-500"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                )}
              >
                <input
                  type="radio"
                  value="PREVENTIVE"
                  {...register("type")}
                  className="hidden"
                />
                <Calendar className="w-6 h-6" />
                <span className="font-medium">Preventive</span>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Equipment
            </label>
            <select
              {...register("equipmentId", {
                required: "Equipment is required",
              })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Equipment</option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} ({eq.location})
                </option>
              ))}
            </select>
            {errors.equipmentId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.equipmentId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subject
            </label>
            <input
              {...register("subject", { required: "Subject is required" })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief summary of the issue"
            />
            {errors.subject && (
              <p className="text-red-500 text-sm mt-1">
                {errors.subject.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
              })}
              rows={4}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Detailed description of the problem..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {requestType === "PREVENTIVE" &&
              ["ADMIN", "MANAGER"].includes(user.role) && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    {...register("scheduledDate", {
                      required: "Date is required for preventive maintenance",
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.scheduledDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.scheduledDate.message}
                    </p>
                  )}
                </div>
              )}
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
