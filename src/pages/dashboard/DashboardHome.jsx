import React, { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";

const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "COMPANY_OWNER":
        navigate("/company-dashboard");
        break;
      case "MANAGER":
      case "ADMIN": // Treating Admin as Manager for now
        navigate("/manager-dashboard");
        break;
      case "TECHNICIAN":
        navigate("/technician-dashboard");
        break;
      case "USER":
        navigate("/employee-dashboard");
        break;
      default:
        navigate("/login");
    }
  }, [user, navigate]);

  return <Loader fullScreen text="Redirecting to your dashboard..." />;
};

export default DashboardHome;
