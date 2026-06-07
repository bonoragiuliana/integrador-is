import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, X, CheckCircle2, Calendar, User, CheckCircle } from 'lucide-react';

export default function PendingInterventions() {
  const [data, setData] = useState({ pendingValidation: [], overdueMachines: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [validatingId, setValidatingId] = useState(null);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/dashboard/interventions');
      if (!response.ok) throw new Error('Error al cargar las urgencias');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async (id) => {
    setValidatingId(id);
    try {
      const response = await fetch(`http://localhost:3000/api/maintenance/${id}/validate`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Error al validar mantenimiento');
      
      // Remover de la lista localmente para no hacer un fetch completo de nuevo
      setData(prev => ({
        ...prev,
        pendingValidation: prev.pendingValidation.filter(item => item.id !== id)
      }));
      setSelectedRecord(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setValidatingId(null);
    }
  };

  const getDaysOverdue = (dateString) => {
    const due = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - due);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Calculando estado del triage...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-700 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  const hasIssues = data.pendingValidation.length > 0 || data.overdueMachines.length > 0;

  return (
    <div className="pb-12 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Urgencias / Triage
        </h1>
        <p className="text-gray-500 mt-2">Panel de priorización de intervenciones y auditorías atrasadas.</p>
      </div>

      {!hasIssues ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Todo al día, no hay intervenciones pendientes</h2>
          <p className="text-gray-500">La planta está operando con su mantenimiento al día y no tenés auditorías colgadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna Izquierda: Pendientes de Validación */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Pendientes de Validación</h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 font-black rounded-full text-sm">{data.pendingValidation.length}</span>
            </div>

            {data.pendingValidation.length === 0 ? (
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 text-center text-gray-500">
                No tenés mantenimientos para auditar.
              </div>
            ) : (
              data.pendingValidation.map(record => (
                <div key={record.id} className="bg-white p-5 rounded-3xl shadow-sm border border-orange-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                        FALTA VALIDAR
                      </span>
                      <h3 className="text-lg font-black text-gray-900">{record.machine?.name}</h3>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase">
                      {record.type}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <User className="w-4 h-4 text-gray-400" /> 
                      {record.user?.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Calendar className="w-4 h-4 text-gray-400" /> 
                      {new Date(record.date).toLocaleDateString('es-AR')}
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedRecord(record)}
                    className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-colors border border-gray-200"
                  >
                    Ver detalle y Validar
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Columna Derecha: Máquinas Vencidas */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-red-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Mantenimientos Vencidos</h2>
              <span className="px-3 py-1 bg-red-100 text-red-700 font-black rounded-full text-sm">{data.overdueMachines.length}</span>
            </div>

            {data.overdueMachines.length === 0 ? (
               <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 text-center text-gray-500">
               Ninguna máquina con mantenimiento vencido.
             </div>
            ) : (
              data.overdueMachines.map(machine => (
                <div key={machine.id} className="bg-white p-5 rounded-3xl shadow-sm border border-red-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          machine.risk === 'ALTO' ? 'bg-red-100 text-red-700' :
                          machine.risk === 'MEDIO' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          Riesgo {machine.risk}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-gray-900">{machine.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{machine.sector}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 px-3 py-2 rounded-xl text-center">
                      <Clock className="w-5 h-5 text-red-500 mx-auto mb-1" />
                      <span className="block text-xs font-black text-red-700 uppercase">
                        {getDaysOverdue(machine.next_maintenance)} días
                      </span>
                      <span className="block text-[10px] text-red-500 font-bold uppercase">
                        Atrasada
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">
                    Venció el: {new Date(machine.next_maintenance).toLocaleDateString('es-AR')}
                  </p>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Modal de Validación */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-orange-50/50">
              <div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                  Auditoría Pendiente
                </span>
                <h2 className="text-xl font-black text-gray-900 leading-tight">{selectedRecord.machine?.name}</h2>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Descripción del Trabajo</p>
                <p className="text-gray-900 font-medium whitespace-pre-wrap">
                  {selectedRecord.description}
                </p>
              </div>

              {selectedRecord.observations && (
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                  <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-1">Observaciones</p>
                  <p className="text-yellow-900 font-medium whitespace-pre-wrap">
                    {selectedRecord.observations}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-sm font-bold text-blue-800">Estado Final Declarado:</span>
                <span className="px-3 py-1 bg-white border border-blue-200 rounded-lg text-sm font-black text-blue-900">
                  {selectedRecord.final_machine_status}
                </span>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button 
                onClick={() => handleValidate(selectedRecord.id)}
                disabled={validatingId === selectedRecord.id}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95"
              >
                {validatingId === selectedRecord.id ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" /> Validar y Cerrar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
