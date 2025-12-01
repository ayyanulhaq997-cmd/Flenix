import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function AdminBatchImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importType, setImportType] = useState<'movies' | 'series' | 'channels'>('movies');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Seleccione un archivo primero');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', importType);

    try {
      const { data } = await axios.post('/api/admin/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setFile(null);
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 1,
        errors: [error.response?.data?.error || 'Error al importar'],
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Importar Contenido en Lote</h1>
          <p className="text-gray-400">Importa múltiples películas, series o canales desde CSV/JSON</p>
        </div>

        {/* Import Form */}
        <div className="bg-slate-800 rounded-lg p-8 space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Tipo de Contenido</label>
            <div className="grid grid-cols-3 gap-4">
              {(['movies', 'series', 'channels'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setImportType(type)}
                  className={`p-4 rounded-lg transition-all ${
                    importType === type
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                  data-testid={`import-type-${type}`}
                >
                  {type === 'movies' && 'Películas'}
                  {type === 'series' && 'Series'}
                  {type === 'channels' && 'Canales'}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">Archivo</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-red-600 transition"
              data-testid="file-upload-area"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-white font-semibold">
                {file ? file.name : 'Arrastra o haz clic para seleccionar'}
              </p>
              <p className="text-gray-400 text-sm">CSV o JSON (máx. 50MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="file-input"
              />
            </div>
          </div>

          {/* Template Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-white font-semibold mb-2">Formato CSV esperado:</p>
            <code className="text-gray-300 text-sm">
              title,year,duration,status,requiredPlan,description
            </code>
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-6 text-lg"
            data-testid="import-button"
          >
            {importing ? (
              <>
                <Loader className="mr-2 animate-spin" size={20} />
                Importando...
              </>
            ) : (
              'Importar'
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 bg-slate-800 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              {result.failed === 0 ? (
                <CheckCircle className="text-green-500" size={32} />
              ) : (
                <AlertCircle className="text-yellow-500" size={32} />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">Importación Completada</h3>
                <p className="text-gray-400">
                  {result.success} exitosos, {result.failed} errores
                </p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-2">Errores:</p>
                <ul className="space-y-1">
                  {result.errors.map((error, i) => (
                    <li key={i} className="text-red-300 text-sm">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
