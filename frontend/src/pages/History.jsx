import { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function History() {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/maintenance');
      if (!response.ok) throw new Error('Error de red');
      const data = await response.json();
      
      // Filtrar solo los del técnico actual
      const myHistory = data.filter(r => r.user_id === user.id);
      setHistory(myHistory);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-primary" />
          Mi Historial
        </h1>
        <p className="text-gray-500 mt-2">Acá podés ver el estado de todos tus reportes enviados.</p>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center">
          <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">No tenés reportes</h2>
          <p className="text-gray-500 mt-2">Cuando completes un mantenimiento aparecerá acá.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map(record => (
            <div key={record.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{record.machine?.name}</h3>
                  <p className="text-sm text-gray-500">Fecha: {new Date(record.date).toLocaleDateString('es-AR')}</p>
                </div>
                <div>
                  {record.validation_status === 'VALIDADO' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> APROBADO
                    </span>
                  )}
                  {record.validation_status === 'RECHAZADO' && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 font-bold text-xs rounded-full flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> RECHAZADO
                    </span>
                  )}
                  {(!record.validation_status || record.validation_status === 'PENDIENTE') && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 font-bold text-xs rounded-full flex items-center gap-1">
                      <Clock className="w-4 h-4" /> EN REVISIÓN
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-xl mb-3 text-sm text-gray-700 font-medium">
                {record.description}
              </div>

              {record.validation_status === 'RECHAZADO' && record.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-red-800 text-sm uppercase mb-1">Corrección Solicitada</span>
                    <p className="text-red-700 font-medium text-sm">
                      "{record.rejection_reason}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
