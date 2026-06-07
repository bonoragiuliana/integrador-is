import { useState } from 'react';
import { ScanLine, Loader2, AlertCircle } from 'lucide-react';
import ScannerResult from '../components/ScannerResult';

export default function QrScanner() {
  const [scanState, setScanState] = useState('idle'); // 'idle' | 'scanning' | 'result' | 'error'
  const [machineData, setMachineData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSimulateScan = async () => {
    setScanState('scanning');
    setErrorMsg('');

    try {
      // Simular delay realista del escaner (1.5 segundos)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Fetch a la API para traer maquinas y elegir una aleatoria
      const response = await fetch('http://localhost:3000/api/machines');
      if (!response.ok) throw new Error('Error al conectar con la base de datos');
      
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error('No hay máquinas registradas en el sistema para escanear. Pedile a un supervisor que registre una primero.');
      }

      // Elegir una máquina aleatoria de la lista para la simulación
      const randomMachine = data[Math.floor(Math.random() * data.length)];
      setMachineData(randomMachine);
      setScanState('result');

    } catch (error) {
      console.error(error);
      setErrorMsg(error.message);
      setScanState('error');
    }
  };

  if (scanState === 'result' && machineData) {
    return (
      <div className="min-h-full px-4 py-8 bg-gray-50">
        <ScannerResult machine={machineData} onRescan={() => setScanState('idle')} />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Escáner Técnico</h1>
        <p className="text-gray-500 mt-2">Apuntá la cámara al código QR del equipo</p>
      </div>

      {/* Escáner Visual Interactivo */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-3xl border-4 border-dashed border-gray-300 flex items-center justify-center shadow-sm overflow-hidden mb-12">
        {scanState === 'scanning' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/5">
            {/* Animación del Láser Verde */}
            <div className="absolute inset-0 overflow-hidden">
               <div className="w-full h-1.5 bg-primary shadow-[0_0_20px_rgba(16,185,129,0.8)] absolute left-0 animate-[scan_1.5s_ease-in-out_infinite]" />
            </div>
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4 relative z-10" />
            <p className="text-primary font-bold animate-pulse relative z-10 text-lg">Leyendo código...</p>
          </div>
        ) : (
          <ScanLine className="w-24 h-24 text-gray-300 transition-transform duration-300 hover:scale-110" />
        )}
      </div>

      {scanState === 'error' && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 max-w-sm w-full animate-in slide-in-from-bottom-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      {/* Botón Masivo Mobile-First */}
      <div className="w-full max-w-sm">
        <button
          onClick={handleSimulateScan}
          disabled={scanState === 'scanning'}
          className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-bold py-5 px-8 rounded-2xl shadow-xl transition-all active:scale-95 text-xl flex items-center justify-center gap-3"
        >
          <ScanLine className="w-7 h-7" />
          {scanState === 'scanning' ? 'Procesando...' : 'Simular Escaneo QR'}
        </button>
      </div>
    </div>
  );
}
