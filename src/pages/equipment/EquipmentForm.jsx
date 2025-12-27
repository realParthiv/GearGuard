import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const EquipmentForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          const data = await api.equipment.getById(id);
          reset(data);
        } catch (error) {
          console.error("Failed to fetch equipment:", error);
        }
      };
      fetchData();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await api.equipment.update(id, data);
      } else {
        await api.equipment.create(data);
      }
      navigate("/equipment");
    } catch (error) {
      console.error("Failed to save equipment:", error);
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
          {isEditMode ? "Edit Equipment" : "Add New Equipment"}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Equipment Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Hydraulic Press X1"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location
            </label>
            <input
              {...register("location", { required: "Location is required" })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Floor 1, Zone A"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Image URL
            </label>
            <input
              {...register("image")}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="OPERATIONAL">Operational</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="SCRAP">Scrap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Last Maintenance
              </label>
              <input
                type="date"
                {...register("lastMaintenance")}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
              {isEditMode ? "Update Equipment" : "Create Equipment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentForm;
