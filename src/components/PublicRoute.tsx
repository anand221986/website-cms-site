import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import FullPageSpinner from "@/components/FullPageSpinner";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <FullPageSpinner />;
  }

  if (user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PublicRoute;
