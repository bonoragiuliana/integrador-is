import { AlertTriangle } from 'lucide-react';

export default function ReportIssue() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reportar Falla</h1>
        <p className="text-gray-500 text-sm mt-1">Generá un ticket rápido para que un técnico revise la máquina.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Próximamente</h2>
        <p className="text-gray-500 mt-2">Formulario de reporte rápido en construcción.</p>
      </div>
    </div>
  );
}
