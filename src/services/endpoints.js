export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    REFRESH: "/auth/refresh/",
    ME: "/auth/me/",
    ROLES: "/auth/roles/",
    MANAGERS: "/auth/managers/",
    EMPLOYEES: "/auth/employees/",
  },
  EQUIPMENT: {
    LIST: "/equipment/",
    DETAIL: (id) => `/equipment/${id}/`,
  },
  MAINTENANCE: {
    CREATE_REQUEST: "/maintenance/",
    LIST: "/maintenance/requests/",
    STATS: "/maintenance/stats/",
    DETAIL: (id) => `/maintenance/requests/${id}/`,
    MY_TASKS: "/maintenance/my_tasks/",
    KANBAN: "/maintenance/kanban/",
    CALENDAR: "/maintenance/calendar/",
  },
};
