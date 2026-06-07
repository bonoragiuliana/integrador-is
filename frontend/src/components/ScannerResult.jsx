import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, MapPin, Calendar, CheckCircle2, History } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ScannerResult({ machine, onRescan }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!machine) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPERATIVA': return 'bg-green-100 text-green-700 border-green-200';
      case 'FALLA': return 'bg-red-100 text-red-700 border-red-200';
      case 'MANTENIMIENTO': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'INACTIVA': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'ALTO': return 'text-red-600 bg-red-50';
      case 'MEDIO': return 'text-yellow-600 bg-yellow-50';
      case 'BAJO': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-6 animate-in fade-in zoom-in duration-300">
      {/* Header Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{machine.name}</h2>
            <p className="text-gray-500 font-mono text-sm">MQR-{machine.id.slice(0,6).toUpperCase()}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(machine.status)}`}>
            Estado: {machine.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(machine.risk)}`}>
            Riesgo: {machine.risk}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Ubicación / Sector</p>
              <p className="font-medium text-gray-900">{machine.sector}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Próximo Mantenimiento</p>
              <p className="font-medium text-gray-900">
                {machine.next_maintenance ? new Date(machine.next_maintenance).toLocaleDateString('es-AR') : 'No programado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial (Detallado para Inspector o Placeholder para otros) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Historial de Intervenciones
          </h3>
        </div>
        
        {user?.role === 'INSPECTOR' ? (
          <div className="space-y-4">
            {/* Mock Data for Inspector */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">PREVENTIVO</span>
                <span className="text-xs text-gray-500 font-medium">Hace 15 días</span>
              </div>
              <p className="text-sm text-gray-900 font-medium mb-1">Cambio de filtros y lubricación general</p>
              <div className="flex justify-between items-end mt-3">
                <p className="text-xs text-gray-500">Téc. Juan Pérez</p>
                <span className="text-xs text-green-600 font-semibold">Validado</span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">CORRECTIVO</span>
                <span className="text-xs text-gray-500 font-medium">Hace 2 meses</span>
              </div>
              <p className="text-sm text-gray-900 font-medium mb-1">Reemplazo de motor paso a paso</p>
              <div className="flex justify-between items-end mt-3">
                <p className="text-xs text-gray-500">Téc. Mario Gómez</p>
                <span className="text-xs text-green-600 font-semibold">Validado</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500">Sin intervenciones recientes registradas.</p>
          </div>
        )}
      </div>

      {/* Action Buttons (Massive Mobile-First) */}
      <div className="space-y-3 pt-2">
        {user?.role !== 'INSPECTOR' && (
          <button
            onClick={() => navigate('/operativo/mantenimiento')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-transform active:scale-95 text-lg"
          >
            Registrar Mantenimiento
          </button>
        )}
        <button
          onClick={onRescan}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-2xl border-2 border-gray-200 transition-colors text-lg"
        >
          Volver a Escanear
        </button>
      </div>
    </div>
  );
}
