import { Navigate } from "react-router-dom";

/** District primary landing → Mission Control operational room */
export default function AdminDashboard() {
  return <Navigate to="/district-admin/mission-control" replace />;
}
