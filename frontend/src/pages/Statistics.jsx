import { useState, useEffect } from 'react';
import { PieChart, Activity, Clock, CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/statistics');
        if (!response.ok) throw new Error('Error al cargar estadísticas');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
        {error}
      </div>
    );
  }

  const hasData = stats && (stats.summary.total > 0 || stats.orders.total > 0);

  if (!hasData) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
        <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-1">No hay suficientes datos</h3>
        <p className="text-gray-500">Aún no hay suficientes registros para mostrar estadísticas.</p>
      </div>
    );
  }

  // Helper para el Gráfico de Torta (CSS Conic Gradient)
  const totalMachines = Object.values(stats.machines).reduce((a, b) => a + b, 0);
  const getPieStyle = () => {
    if (totalMachines === 0) return { background: '#f3f4f6' };
    
    const op = (stats.machines.OPERATIVA / totalMachines) * 100;
    const mt = (stats.machines.MANTENIMIENTO / totalMachines) * 100;
    const fa = (stats.machines.FALLA / totalMachines) * 100;
    const inact = (stats.machines.INACTIVA / totalMachines) * 100;
    
    // Colores: OPERATIVA (Verde), MANTENIMIENTO (Amarillo), FALLA (Rojo), INACTIVA (Gris)
    return {
      background: `conic-gradient(
        #22c55e 0% ${op}%, 
        #eab308 ${op}% ${op + mt}%, 
        #ef4444 ${op + mt}% ${op + mt + fa}%, 
        #9ca3af ${op + mt + fa}% 100%
      )`
    };
  };

  // Helper para el Gráfico de Barras
  const maxTrend = Math.max(...stats.monthlyTrend.map(m => m.count), 1);

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <PieChart className="w-8 h-8 text-primary" />
          Estadísticas Generales
        </h1>
        <p className="text-gray-500 mt-2">Métricas de alto nivel para toma de decisiones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* RESUMEN GENERAL - CARDS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Mantenimientos</p>
            <p className="text-4xl font-black text-gray-900">{stats.summary.total}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 p-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{stats.summary.validationPercentage}% Validados</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm col-span-1 md:col-span-1 lg:col-span-2">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Distribución por Tipo</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-blue-500 text-xs font-bold uppercase mb-1">Preventivos</p>
              <p className="text-2xl font-black text-blue-700">{stats.summary.types.PREVENTIVO}</p>
            </div>
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
              <p className="text-red-500 text-xs font-bold uppercase mb-1">Correctivos</p>
              <p className="text-2xl font-black text-red-700">{stats.summary.types.CORRECTIVO}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Inspección</p>
              <p className="text-2xl font-black text-gray-700">{stats.summary.types.INSPECCION}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Órdenes de Trabajo</p>
            <p className="text-4xl font-black text-gray-900">{stats.orders.total}</p>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Completadas</span>
              <span className="font-bold text-green-600">{stats.orders.completed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Pendientes</span>
              <span className="font-bold text-orange-500">{stats.orders.pending}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO DE TORTA: ESTADO DE MÁQUINAS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Activity className="w-6 h-6 text-indigo-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Estado de Máquinas</h2>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
            <div 
              className="w-48 h-48 rounded-full shadow-inner relative"
              style={getPieStyle()}
            >
              {/* Hueco del centro para hacerlo "Donut" si queremos, sino lo dejamos como torta */}
              <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                <span className="text-2xl font-black text-gray-900">{totalMachines}</span>
                <span className="text-xs font-bold text-gray-400">Total</span>
              </div>
            </div>

            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-600">Operativas</span>
                </div>
                <span className="font-bold text-gray-900">{stats.machines.OPERATIVA}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-600">Mantenimiento</span>
                </div>
                <span className="font-bold text-gray-900">{stats.machines.MANTENIMIENTO}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-600">Falla</span>
                </div>
                <span className="font-bold text-gray-900">{stats.machines.FALLA}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm font-medium text-gray-600">Inactivas</span>
                </div>
                <span className="font-bold text-gray-900">{stats.machines.INACTIVA}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TENDENCIA Y TIEMPOS */}
        <div className="space-y-6">
          {/* TIEMPO PROMEDIO RESOLUCIÓN */}
          <div className="bg-primary text-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-primary-100 font-bold uppercase tracking-wider text-sm mb-1">Tiempo de Resolución Promedio</p>
              <div className="flex items-end gap-2">
                <p className="text-4xl font-black">{stats.orders.avgResolutionTimeHours}</p>
                <p className="font-medium text-primary-200 mb-1">horas por orden</p>
              </div>
            </div>
            <div className="p-4 bg-white/10 rounded-2xl">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* MANTENIMIENTOS POR MES */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Mantenimientos por Mes</h2>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-40 px-2 sm:px-6">
              {stats.monthlyTrend.map((month) => {
                const heightPercent = Math.max((month.count / maxTrend) * 100, 5); // 5% minimo
                return (
                  <div key={month.key} className="flex flex-col items-center flex-1 group">
                    <div className="mb-2 text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                      {month.count > 0 ? month.count : ''}
                    </div>
                    <div className="w-full max-w-[40px] bg-blue-50 rounded-t-lg relative overflow-hidden group-hover:bg-blue-100 transition-colors" style={{ height: '100%' }}>
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-1000 ease-out"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    <div className="mt-3 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {month.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
