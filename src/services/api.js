import axiosInstance from "./axiosConfig";

const api = {
  equipment: {
    getAll: async () => {
      const response = await axiosInstance.get("/equipment/");
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
    getById: async (id) => {
      const response = await axiosInstance.get(`/equipment/${id}/`);
      return response.data;
    },
    create: async (data) => {
      const response = await axiosInstance.post("/equipment/", data);
      return response.data;
    },
    update: async (id, data) => {
      const response = await axiosInstance.patch(`/equipment/${id}/`, data);
      return response.data;
    },
  },
  maintenance: {
    getRequests: async () => {
      const response = await axiosInstance.get("/maintenance/");
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
    createRequest: async (data) => {
      console.log("API createRequest data:", data);
      const response = await axiosInstance.post("/maintenance/", data);
      return response.data;
    },
    updateStatus: async (id, data) => {
      const response = await axiosInstance.patch(`/maintenance/${id}/`, data);
      return response.data;
    },
    getKanban: async () => {
      const response = await axiosInstance.get("/maintenance/kanban/");
      console.log("Kanban", response.data);
      if (response.data && !Array.isArray(response.data) && !response.data.results) {
         // Handle { NEW: [], IN_PROGRESS: [] } structure
         return Object.values(response.data).flat();
      }
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
    getMyTasks: async () => {
      const response = await axiosInstance.get("/maintenance/my_tasks/");
      console.log(response.data);
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
    getCalendar: async (start, end) => {
      // Assuming the backend filters by date range or returns all. 
      // For now, fetching all and client-side filtering logic might be applied where used.
      const response = await axiosInstance.get("/maintenance/");

      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  },
  teams: {
    create: async (data) => {
      const response = await axiosInstance.post("/teams/", data);
      return response.data;
    },
    getAll: async () => {
      const response = await axiosInstance.get("/teams/");
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    },
  },
  employees: {
    create: async (data) => {
      console.log(data);
      const response = await axiosInstance.post("/auth/employees/", data);
      return response.data;
    },
    getAll: async () => { // Assuming an endpoint exists to list employees for team creation
      const response = await axiosInstance.get("/auth/employees/"); 
      console.log("Employees", response.data);
      return Array.isArray(response.data) ? response.data : (response.data.results || []);
    }
  }
};

export default api;
