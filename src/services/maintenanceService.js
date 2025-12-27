import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "./endpoints";

const maintenanceService = {
  getStats: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MAINTENANCE.STATS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRequests: async (params = {}) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MAINTENANCE.LIST, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRequest: async (id) => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.MAINTENANCE.DETAIL(id)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default maintenanceService;
