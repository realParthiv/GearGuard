import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "./endpoints";

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  refreshToken: async (refresh) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.AUTH.REFRESH, {
        refresh,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRoles: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.ROLES);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService;
