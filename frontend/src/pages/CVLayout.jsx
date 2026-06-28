import { Outlet } from 'react-router-dom';
import { HVTProvider } from '../context/HVTContext';

/**
 * CVLayout – Provides HVT authentication context to all CV routes.
 * Any nested route inside /cv will have access to useHVT().
 */
export default function CVLayout() {
  return (
    <HVTProvider>
      {/* Outlet renders the matched child route (CVManager, CVDetail, etc.) */}
      <Outlet />
    </HVTProvider>
  );
}
