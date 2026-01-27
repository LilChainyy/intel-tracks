// Authentication removed - all routes are now public
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // No authentication check - just render children
  return <>{children}</>;
}
