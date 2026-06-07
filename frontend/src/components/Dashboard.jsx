import { useState, useEffect } from 'react';
import { 
  Activity, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/supervisor');
        if (!response.ok) throw new Error('Error al cargar métricas del dashboard');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Calculando métricas de planta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-red-700 flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        <p className="font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          Panel de Control
        </h1>
        <p className="text-gray-500 mt-2">Visión general del estado operativo de la planta.</p>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Máquinas Totales</p>
            <p className="text-3xl font-black text-gray-900">{metrics?.summary?.totalMachines || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Operativas</p>
            <p className="text-3xl font-black text-green-600">{metrics?.summary?.operativeMachines || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">En Falla</p>
            <p className="text-3xl font-black text-red-600">{metrics?.summary?.failureMachines || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Por Validar</p>
            <p className="text-3xl font-black text-orange-600">{metrics?.summary?.pendingValidation || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna Izquierda: Alertas y Órdenes */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Alertas Críticas */}
          <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
            <div className="p-5 border-b border-red-100 bg-red-50/50 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-red-900">Alertas Críticas</h2>
            </div>
            <div className="p-5 space-y-4">
              {metrics?.alerts?.criticalOrders?.length > 0 ? (
                metrics.alerts.criticalOrders.map(order => (
                  <div key={order.id} className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100 text-sm">
                    <span className="font-bold">OT Crítica: </span>
                    {order.machine?.name} ({new Date(order.limit_date).toLocaleDateString()})
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay OTs críticas pendientes.</p>
              )}
              
              {metrics?.alerts?.overdueMachines?.length > 0 && (
                metrics.alerts.overdueMachines.map(m => (
                  <div key={m.id} className="p-3 bg-orange-50 text-orange-800 rounded-xl border border-orange-100 text-sm">
                    <span className="font-bold">Vence Mantenimiento: </span>
                    {m.name} ({new Date(m.next_maintenance).toLocaleDateString()})
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumen de Órdenes */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-900">Estado de Órdenes</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Pendientes</span>
                <span className="font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{metrics?.workOrders?.PENDIENTE || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-medium">En Progreso</span>
                <span className="font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{metrics?.workOrders?.EN_PROGRESO || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-medium">Completadas</span>
                <span className="font-black text-green-700 bg-green-50 px-3 py-1 rounded-lg">{metrics?.workOrders?.COMPLETADA || 0}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Últimos Mantenimientos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Últimos Mantenimientos Registrados</h2>
            </div>
            <div className="p-0">
              {metrics?.recentMaintenances?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {metrics.recentMaintenances.map(maint => (
                    <div key={maint.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            maint.type === 'PREVENTIVO' ? 'bg-blue-100 text-blue-700' :
                            maint.type === 'CORRECTIVO' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {maint.type}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {maint.machine?.name || 'Máquina eliminada'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1">{maint.description}</p>
                      </div>
                      <div className="flex flex-col sm:items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                          <User className="w-3.5 h-3.5" />
                          {maint.technician?.name || 'Técnico'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(maint.created_at).toLocaleDateString('es-AR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No hay mantenimientos registrados recientes.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
