import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "./endpoints";

const userService = {
  getManagers: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.MANAGERS);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getEmployees: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.EMPLOYEES);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createManager: async (data) => {
    try {
      const payload = {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: "MANAGER",
      };
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.MANAGERS,
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateManager: async (id, data) => {
    try {
      // Assuming update endpoint follows REST pattern: /auth/managers/{id}/
      // Filter out phone or other extra fields
      const payload = {
        full_name: data.full_name,
        email: data.email,
        // Only include password if it's provided (for updates)
        ...(data.password ? { password: data.password } : {}),
        role: "MANAGER",
      };
      const response = await axiosInstance.put(
        `${ENDPOINTS.AUTH.MANAGERS}${id}/`,
        payload
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteManager: async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.AUTH.EMPLOYEES}${id}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;
