import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store/config/redux";
import CommonLayout from "../pages/CommonLayout";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? (
    <CommonLayout>{element}</CommonLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
