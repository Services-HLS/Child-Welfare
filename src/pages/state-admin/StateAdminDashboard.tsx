import { Navigate } from "react-router-dom";

/** State primary landing → Mission Control operational room */
export default function StateAdminDashboard() {
  return <Navigate to="/state-admin/mission-control" replace />;
}
