import { Outlet } from 'react-router-dom';
import { HVTProvider } from '../context/HVTContext';

export default function CVLayout() {
  return (
    <HVTProvider>
      {/* Any CV-specific navigation or headers could go here in the future */}
      <Outlet /> 
    </HVTProvider>
  );
}
