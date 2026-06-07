import { useAuthStore } from '../store/authStore';
import { Shield, PenTool } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
          {user?.role === 'SUPERVISOR' ? (
            <Shield className="w-12 h-12 text-primary mb-4" />
          ) : (
            <PenTool className="w-12 h-12 text-secondary mb-4" />
          )}
          <h2 className="text-lg font-semibold text-gray-900">Rol Actual</h2>
          <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {user?.role}
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 border-dashed flex items-center justify-center">
          <p className="text-gray-500">Historial de Mantenimientos</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 border-dashed flex items-center justify-center">
          <p className="text-gray-500">Escáner QR Rápido</p>
        </div>
      </div>
    </div>
  );
}
