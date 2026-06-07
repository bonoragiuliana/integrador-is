import { useState, useEffect } from 'react';
import { History, Filter, Search, CheckCircle2, Clock, Calendar, User, Wrench, X, Tag } from 'lucide-react';

export default function MaintenanceHistory() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterValidation, setFilterValidation] = useState('');

  // Modal
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/maintenance');
      if (!response.ok) throw new Error('Error al cargar el historial');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHistory = history.filter(record => {
    const matchesSearch = record.machine?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          record.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? record.type === filterType : true;
    const matchesValidation = filterValidation !== '' ? 
      (filterValidation === 'VALIDADO' ? record.is_validated : !record.is_validated) : true;
    
    return matchesSearch && matchesType && matchesValidation;
  });

  const getTypeColor = (type) => {
    switch(type) {
      case 'PREVENTIVO': return 'bg-purple-100 text-purple-700';
      case 'CORRECTIVO': return 'bg-red-100 text-red-700';
      case 'INSPECCION': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Historial Global
          </h1>
          <p className="text-gray-500 mt-2">Auditoría de todos los mantenimientos registrados en planta.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="font-bold text-gray-700">Filtros de Búsqueda</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar máquina o técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-shadow"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-shadow cursor-pointer"
          >
            <option value="">Todos los tipos</option>
            <option value="PREVENTIVO">Preventivo</option>
            <option value="CORRECTIVO">Correctivo</option>
            <option value="INSPECCION">Inspección</option>
          </select>
          <select
            value={filterValidation}
            onChange={(e) => setFilterValidation(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary outline-none transition-shadow cursor-pointer"
          >
            <option value="">Cualquier estado</option>
            <option value="PENDIENTE">Solo Pendientes</option>
            <option value="VALIDADO">Solo Validados</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Cargando historial...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <X className="w-5 h-5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No se encontraron mantenimientos con esos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map(record => (
            <div 
              key={record.id} 
              onClick={() => setSelectedRecord(record)}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getTypeColor(record.type)}`}>
                    {record.type}
                  </span>
                  {!record.is_validated ? (
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> PENDIENTE
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VALIDADO
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                  {record.machine?.name || 'Máquina Eliminada'}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(record.date).toLocaleDateString('es-AR')}</span>
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {record.user?.name || 'Usuario Eliminado'}</span>
                </div>
              </div>
              <div className="shrink-0 hidden sm:block">
                <button className="px-5 py-2.5 bg-gray-50 text-gray-700 font-bold rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getTypeColor(selectedRecord.type)}`}>
                    {selectedRecord.type}
                  </span>
                  {!selectedRecord.is_validated && (
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wider">
                      PENDIENTE VALIDACIÓN
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedRecord.machine?.name}</h2>
                <p className="text-xs font-mono text-gray-400 mt-1 uppercase">TICKET-{selectedRecord.id.slice(0,8)}</p>
              </div>
              <button 
                onClick={() => setSelectedRecord(null)} 
                className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><User className="w-4 h-4" /> Técnico Responsable</p>
                  <p className="font-bold text-gray-900 text-lg">{selectedRecord.user?.name}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Fecha de Reporte</p>
                  <p className="font-bold text-gray-900 text-lg">{new Date(selectedRecord.date).toLocaleDateString('es-AR')}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2"><Wrench className="w-4 h-4" /> Trabajo Realizado</p>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                  {selectedRecord.description}
                </div>
              </div>

              {selectedRecord.observations && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2"><Tag className="w-4 h-4" /> Observaciones Extra</p>
                  <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100 text-gray-800 whitespace-pre-wrap font-medium leading-relaxed">
                    {selectedRecord.observations}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 mt-4">
                <div>
                  <span className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Estado Post-Intervención</span>
                  <span className="text-sm text-blue-600 font-medium">Estado final de la máquina según el técnico.</span>
                </div>
                <span className="px-4 py-2 bg-white border border-blue-200 shadow-sm rounded-xl text-sm font-black text-blue-900">
                  {selectedRecord.final_machine_status}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
