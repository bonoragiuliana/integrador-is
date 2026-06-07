import { useState, useEffect } from 'react';
import { LineChart, AlertTriangle, User, Wrench, Factory } from 'lucide-react';

export default function Metrics() {
  const [metrics, setMetrics] = useState({
    topMachines: [],
    topSectors: [],
    topTechnicians: [],
    monthlyTrend: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/dashboard/metrics');
        if (!response.ok) throw new Error('Error al cargar indicadores');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();
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

  const hasData = metrics.topMachines.length > 0 || metrics.topTechnicians.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
        <LineChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-1">No hay suficientes datos</h3>
        <p className="text-gray-500">Aún no hay suficientes mantenimientos registrados para generar indicadores.</p>
      </div>
    );
  }

  // Cálculos para el gráfico de barras (encontrar el máximo para escalar)
  const maxTrend = Math.max(...metrics.monthlyTrend.map(m => m.count), 1);

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <LineChart className="w-8 h-8 text-primary" />
          Indicadores y Fallas
        </h1>
        <p className="text-gray-500 mt-2">Análisis de fallas recurrentes y rendimiento.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* TOP MÁQUINAS CON FALLAS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Máquinas con Más Fallas</h2>
          </div>
          
          {metrics.topMachines.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay fallas registradas</p>
          ) : (
            <div className="space-y-4">
              {metrics.topMachines.map((machine, index) => (
                <div key={machine.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-gray-300">#{index + 1}</span>
                    <div>
                      <p className="font-bold text-gray-900">{machine.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{machine.sector}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-black text-xl">{machine.count}</span>
                    <span className="text-xs font-bold text-red-400 uppercase">Fallas</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FALLAS POR SECTOR */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Factory className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Fallas por Sector</h2>
          </div>
          
          {metrics.topSectors.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay fallas registradas</p>
          ) : (
            <div className="space-y-3">
              {metrics.topSectors.map((sector) => (
                <div key={sector.sector} className="flex justify-between items-center bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <span className="font-bold text-gray-800">{sector.sector}</span>
                  <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-lg font-black text-sm">
                    {sector.count} fallas
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TÉCNICOS DESTACADOS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Intervenciones por Técnico</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.topTechnicians.map((tech, index) => (
              <div key={tech.name} className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                  {index + 1}
                </div>
                <div>
                  <p className="font-bold text-gray-900 truncate">{tech.name}</p>
                  <p className="text-sm font-medium text-gray-500">{tech.count} mantenimientos</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TENDENCIA MENSUAL (Gráfico Nativo) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-50 rounded-xl">
              <Wrench className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Tendencia Mensual</h2>
              <p className="text-sm text-gray-500 font-medium">Volumen de mantenimientos en los últimos 6 meses</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-64 mt-4 px-2 sm:px-8">
            {metrics.monthlyTrend.map((month) => {
              const heightPercent = Math.max((month.count / maxTrend) * 100, 5); // 5% minimo visual
              return (
                <div key={month.key} className="flex flex-col items-center flex-1 group">
                  <div className="mb-2 text-xs font-bold text-gray-400 group-hover:text-primary transition-colors">
                    {month.count > 0 ? month.count : ''}
                  </div>
                  <div className="w-full max-w-[48px] bg-gray-100 rounded-t-lg relative overflow-hidden group-hover:bg-gray-200 transition-colors" style={{ height: '100%' }}>
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all duration-1000 ease-out"
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
  );
}
