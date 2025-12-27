import axiosInstance from "./axiosConfig";
import { ENDPOINTS } from "./endpoints";

const equipmentService = {
  getEquipmentList: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.EQUIPMENT.LIST);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default equipmentService;
