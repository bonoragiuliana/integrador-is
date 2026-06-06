import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { QrCode, Shield, PenTool } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">MantechQR</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hola, <strong>{user?.name}</strong></span>
              <button 
                onClick={handleLogout}
                className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Panel de Control</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
              {user?.role === 'Administrador' ? (
                <Shield className="w-12 h-12 text-primary mb-4" />
              ) : (
                <PenTool className="w-12 h-12 text-secondary mb-4" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">Rol Actual</h2>
              <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user?.role}
              </span>
            </div>
            
            {/* Tareas futuras placeholders */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 border-dashed flex items-center justify-center">
              <p className="text-gray-500">Próximamente: Historial de Mantenimientos</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 border-dashed flex items-center justify-center">
              <p className="text-gray-500">Próximamente: Escáner QR</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
