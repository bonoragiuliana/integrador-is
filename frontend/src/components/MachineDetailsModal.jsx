import { X, Calendar, Activity, ShieldAlert, MapPin, Hash, PenTool } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function MachineDetailsModal({ machine, onClose, onEdit }) {
  if (!machine) return null;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'OPERATIVA': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">Operativa</span>;
      case 'FALLA': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200">En Falla</span>;
      case 'MANTENIMIENTO': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold border border-yellow-200">Mantenimiento</span>;
      case 'INACTIVA': return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold border border-gray-200">Inactiva</span>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Lado Izquierdo: Datos */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{machine.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500 font-mono">ID: {machine.id.slice(0,8)}...</span>
              </div>
            </div>
            <div className="md:hidden">
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Estado Actual</span>
                </div>
                <div className="mt-2">
                  {getStatusBadge(machine.status)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Riesgo</span>
                </div>
                <span className={`text-sm font-bold ${machine.risk === 'ALTO' ? 'text-red-600' : machine.risk === 'MEDIO' ? 'text-yellow-600' : 'text-blue-600'}`}>
                  {machine.risk}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Sector / Ubicación</p>
                  <p className="text-sm font-semibold text-gray-900">{machine.sector}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Frecuencia de Mantenimiento</p>
                  <p className="text-sm font-semibold text-gray-900">{machine.maintenance_frequency || 'No especificada'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Próximo Mantenimiento</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {machine.next_maintenance ? new Date(machine.next_maintenance).toLocaleDateString('es-AR') : 'Sin fecha programada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center">
             <button onClick={onEdit} className="text-primary hover:text-primary-dark font-medium text-sm transition-colors">
                Editar Información
             </button>
          </div>
        </div>

        {/* Lado Derecho: QR */}
        <div className="md:w-64 bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100">
          <div className="hidden md:flex w-full justify-end mb-auto">
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
            <QRCodeSVG value={machine.qr_code} size={150} level="H" />
          </div>
          <p className="text-xs font-mono text-gray-500 bg-gray-200 px-3 py-1 rounded-md">
            {machine.qr_code}
          </p>
          <p className="text-xs text-center text-gray-400 mt-4">
            Escaneá este código desde la app móvil para acceder al historial.
          </p>

          <div className="mt-auto hidden md:block"></div>
        </div>

      </div>
    </div>
  );
}
