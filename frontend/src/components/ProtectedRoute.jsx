import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Wraps a route so only authenticated users (with the right role) can access it.
 *
 * requiredRole can be:
 *   - undefined / omitted  → any logged-in user is allowed
 *   - "donor"              → single role string (existing behaviour)
 *   - ["donor","receiver"] → array of allowed roles (new)
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Accept both a single string and an array of allowed roles
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}