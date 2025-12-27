import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import EquipmentList from "./pages/equipment/EquipmentList";
import EquipmentDetail from "./pages/equipment/EquipmentDetail";
import EquipmentForm from "./pages/equipment/EquipmentForm";
import RequestsList from "./pages/maintenance/RequestList";
import RequestForm from "./pages/maintenance/RequestForm";
import KanbanBoard from "./pages/kanban/KanbanBoard";
import MaintenanceCalendar from "./pages/calendar/MaintenanceCalendar";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Loader from "./components/common/Loader";

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Authenticating..." />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/equipment" element={<EquipmentList />} />
              <Route path="/equipment/new" element={<EquipmentForm />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              <Route path="/requests" element={<RequestsList />} />
              <Route path="/requests/new" element={<RequestForm />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/calendar" element={<MaintenanceCalendar />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
