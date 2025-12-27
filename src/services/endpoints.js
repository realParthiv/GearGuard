export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    REFRESH: "/auth/refresh/",
    ME: "/auth/me/",
  },
  EQUIPMENT: {
    LIST: "/equipment/",
    DETAIL: (id) => `/equipment/${id}/`,
  },
  MAINTENANCE: {
    LIST: "/maintenance/requests/",
    DETAIL: (id) => `/maintenance/requests/${id}/`,
    KANBAN: "/maintenance/kanban/",
    CALENDAR: "/maintenance/calendar/",
  },
};
