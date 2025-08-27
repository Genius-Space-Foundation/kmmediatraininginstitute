import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { FullPageLoader } from "./LoadingSpinner";

interface TrainerRouteProps {
  children: React.ReactNode;
}

const TrainerRoute: React.FC<TrainerRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageLoader text="Loading trainer dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "trainer") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default TrainerRoute;
