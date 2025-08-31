// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hook';
import { selectIsAuthed } from '../features/auth/selectors';

export default function ProtectedRoute() {
  const authed = useAppSelector(selectIsAuthed);
  const loc = useLocation();
  if (!authed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
