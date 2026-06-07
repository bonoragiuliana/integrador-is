import { useAuthStore } from '../store/authStore';
import { PenTool, CheckSquare, AlertCircle } from 'lucide-react';

export default function OperativeDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.name}</h1>
        <p className="text-gray-500 text-sm mt-1">Panel Operativo - Perfil de {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Tareas de hoy</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Alertas</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
           <PenTool className="w-8 h-8 text-gray-400 mb-2" />
           <p className="text-sm font-medium text-gray-900">Listo para trabajar</p>
        </div>
      </div>
    </div>
  );
}
