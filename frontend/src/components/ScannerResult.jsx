import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, MapPin, Calendar, CheckCircle2, History } from 'lucide-react';

export default function ScannerResult({ machine, onRescan }) {
  const navigate = useNavigate();

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

      {/* Historial Placeholder */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            Últimas Intervenciones
          </h3>
        </div>
        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">Sin intervenciones recientes registradas.</p>
        </div>
      </div>

      {/* Action Buttons (Massive Mobile-First) */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => navigate('/operativo/mantenimiento')}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-transform active:scale-95 text-lg"
        >
          Registrar Mantenimiento
        </button>
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
