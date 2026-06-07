import { ClipboardList } from 'lucide-react';

export default function WorkOrders() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo</h1>
        <p className="text-gray-500 text-sm mt-1">Listado de mantenimientos pendientes y realizados.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-4">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Próximamente</h2>
        <p className="text-gray-500 mt-2 max-w-md">Este módulo será implementado en las próximas Historias de Usuario.</p>
      </div>
    </div>
  );
}
