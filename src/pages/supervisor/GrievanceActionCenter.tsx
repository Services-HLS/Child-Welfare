import { Navigate } from "react-router-dom";

/** Legacy route — primary queue is Public Grievance Center */
export default function GrievanceActionCenter() {
  return <Navigate to="/supervisor/public-grievance-center" replace />;
}
