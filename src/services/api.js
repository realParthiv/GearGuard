import axios from "axios";

// --- MOCK DATA ---

const USERS = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@gearguard.com",
    role: "ADMIN",
    avatar: "https://i.pravatar.cc/150?u=admin",
  },
  {
    id: 2,
    name: "Manager User",
    email: "manager@gearguard.com",
    role: "MANAGER",
    avatar: "https://i.pravatar.cc/150?u=manager",
  },
  {
    id: 3,
    name: "Tech User",
    email: "tech@gearguard.com",
    role: "TECHNICIAN",
    avatar: "https://i.pravatar.cc/150?u=tech",
  },
  {
    id: 4,
    name: "Regular User",
    email: "user@gearguard.com",
    role: "USER",
    avatar: "https://i.pravatar.cc/150?u=user",
  },
];

const EQUIPMENT = [
  {
    id: 1,
    name: "Hydraulic Press X1",
    status: "OPERATIONAL",
    location: "Floor 1",
    lastMaintenance: "2023-10-15",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "CNC Milling Machine",
    status: "MAINTENANCE",
    location: "Floor 2",
    lastMaintenance: "2023-11-01",
    image:
      "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Conveyor Belt System",
    status: "OPERATIONAL",
    location: "Warehouse",
    lastMaintenance: "2023-09-20",
    image:
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 4,
    name: "Industrial Robot Arm",
    status: "SCRAP",
    location: "Storage",
    lastMaintenance: "2023-01-10",
    image:
      "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=300&q=80",
  },
];

const REQUESTS = [
  {
    id: 101,
    equipmentId: 2,
    equipmentName: "CNC Milling Machine",
    subject: "Vibration issue",
    description: "Strange noise during operation",
    status: "IN_PROGRESS",
    priority: "HIGH",
    type: "CORRECTIVE",
    reportedBy: "Regular User",
    assignedTo: "Tech User",
    createdDate: "2023-11-10",
  },
  {
    id: 102,
    equipmentId: 1,
    equipmentName: "Hydraulic Press X1",
    subject: "Monthly Checkup",
    description: "Routine inspection",
    status: "NEW",
    priority: "MEDIUM",
    type: "PREVENTIVE",
    reportedBy: "Manager User",
    assignedTo: null,
    createdDate: "2023-11-12",
    scheduledDate: "2023-11-15",
  },
  {
    id: 103,
    equipmentId: 3,
    equipmentName: "Conveyor Belt System",
    subject: "Belt misalignment",
    description: "Belt slipping off track",
    status: "REPAIRED",
    priority: "CRITICAL",
    type: "CORRECTIVE",
    reportedBy: "Regular User",
    assignedTo: "Tech User",
    createdDate: "2023-11-05",
    completedDate: "2023-11-06",
  },
];

// --- API SERVICE ---

// Simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = {
  auth: {
    login: async (credentials) => {
      await delay(500);
      const user = USERS.find((u) => u.email === credentials.email);
      if (user) {
        // Mock token
        return { token: "mock-jwt-token-123", user };
      }
      throw new Error("Invalid credentials");
    },
    me: async () => {
      await delay(300);
      // For simplicity, just return the first user or simulate based on stored token if we implemented that logic fully
      // Here we assume the caller handles the context
      return USERS[0];
    },
  },
  equipment: {
    getAll: async () => {
      await delay(500);
      return [...EQUIPMENT];
    },
    getById: async (id) => {
      await delay(300);
      return EQUIPMENT.find((e) => e.id === parseInt(id));
    },
    create: async (data) => {
      await delay(500);
      const newEquipment = {
        ...data,
        id: EQUIPMENT.length + 1,
        status: "OPERATIONAL",
      };
      EQUIPMENT.push(newEquipment);
      return newEquipment;
    },
    update: async (id, data) => {
      await delay(500);
      const index = EQUIPMENT.findIndex((e) => e.id === parseInt(id));
      if (index !== -1) {
        EQUIPMENT[index] = { ...EQUIPMENT[index], ...data };
        return EQUIPMENT[index];
      }
      throw new Error("Equipment not found");
    },
  },
  maintenance: {
    getRequests: async () => {
      await delay(500);
      return [...REQUESTS];
    },
    createRequest: async (data) => {
      await delay(500);
      const newRequest = {
        ...data,
        id: REQUESTS.length + 100,
        status: "NEW",
        createdDate: new Date().toISOString().split("T")[0],
      };
      REQUESTS.push(newRequest);
      return newRequest;
    },
    updateStatus: async (id, statusData) => {
      await delay(500);
      const index = REQUESTS.findIndex((r) => r.id === parseInt(id));
      if (index !== -1) {
        REQUESTS[index] = { ...REQUESTS[index], ...statusData };
        return REQUESTS[index];
      }
      throw new Error("Request not found");
    },
    getKanban: async () => {
      await delay(500);
      return [...REQUESTS]; // In a real app, this might be filtered or formatted differently
    },
    getCalendar: async (start, end) => {
      await delay(500);
      return REQUESTS.filter((r) => r.scheduledDate); // Simple filter
    },
  },
};

export default api;
