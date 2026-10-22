import React, { useState } from 'react';
import {
  Settings,
  Cloud,
  Moon,
  Sun,
  Calendar,
  Clock,
  Palette,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HelpCircle,
  Check,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AppSettings, HighlightPaletteItem, AppData } from '../types';
import { exportDataAsJSON } from '../services/db';
import { INITIAL_DATA } from '../data/initialData';
import { googleDriveService } from '../services/googleDrive';

interface SettingsSectionProps {
  settings: AppSettings;
  data: AppData;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSyncDriveNow: () => void;
  onConnectDrive: () => void;
  onDisconnectDrive: () => void;
  onImportBackupJSON: (jsonData: AppData) => void;
  onResetAllData: () => void;
  onOpenDriveGuide: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  settings,
  data,
  onUpdateSettings,
  onSyncDriveNow,
  onConnectDrive,
  onDisconnectDrive,
  onImportBackupJSON,
  onResetAllData,
  onOpenDriveGuide,
}) => {
  const [clientIdInput, setClientIdInput] = useState(settings.googleClientId || '');
  const [editingPaletteIndex, setEditingPaletteIndex] = useState<number | null>(null);

  const handleSaveClientId = () => {
    onUpdateSettings({ googleClientId: clientIdInput.trim() });
    alert('ID de Cliente de Google guardado.');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.topics && parsed.settings) {
          if (confirm('¿Deseas restaurar esta copia de seguridad? Se reemplazará el estado actual (se guardará un snapshot previo de seguridad).')) {
            onImportBackupJSON(parsed);
          }
        } else {
          alert('El archivo no parece ser una copia de seguridad válida de MiOpo AAE.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const updatePaletteMeaning = (index: number, meaning: string, name: string) => {
    const newPalette = [...settings.highlightPalette];
    newPalette[index] = { ...newPalette[index], meaning, name };
    onUpdateSettings({ highlightPalette: newPalette });
    setEditingPaletteIndex(null);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" /> Ajustes y Sincronización
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configuración de Google Drive, apariencia, cuenta atrás del examen y copias de seguridad.
        </p>
      </div>

      {/* SECTION 1: GOOGLE DRIVE SYNC (Core Requirement) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Sincronización con Google Drive
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guarda tus datos en tu propia cuenta de Google (carpeta «MiOpo AAE», archivo datos.json) con alcance drive.file.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenDriveGuide}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            <HelpCircle className="w-4 h-4" /> Guía paso a paso para no programadores
          </button>
        </div>

        {/* Current status info */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-600 dark:text-slate-300 block">
              Estado de la conexión:
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  settings.driveSyncStatus === 'sincronizado'
                    ? 'bg-emerald-500'
                    : settings.driveSyncStatus === 'error'
                    ? 'bg-rose-500'
                    : settings.driveSyncStatus === 'pendiente'
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-slate-400'
                }`}
              />
              <span className="font-semibold capitalize text-slate-900 dark:text-white">
                {settings.driveSyncStatus}
              </span>
              {settings.lastSyncTimestamp && (
                <span className="text-slate-400">(Última sincro: {settings.lastSyncTimestamp})</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {googleDriveService.isConnected() ? (
              <>
                <button
                  onClick={onSyncDriveNow}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sincronizar Ahora
                </button>
                <button
                  onClick={onDisconnectDrive}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-semibold text-slate-600 dark:text-slate-300 transition"
                >
                  Desconectar
                </button>
              </>
            ) : (
              <button
                onClick={onConnectDrive}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Cloud className="w-4 h-4" /> Conectar con Google Drive
              </button>
            )}
          </div>
        </div>

        {/* Client ID field */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            ID de Cliente OAuth 2.0 de Google (Google Cloud Console)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              placeholder="Ej: 123456789-abcdefgh.apps.googleusercontent.com"
              className="flex-1 text-xs font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
            <button
              onClick={handleSaveClientId}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 whitespace-nowrap"
            >
              Guardar Client ID
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            También puedes definirlo en la constante <code>GOOGLE_CLIENT_ID</code> del código fuente. Si está vacío, la app funciona en modo local con IndexedDB.
          </p>
        </div>
      </div>

      {/* SECTION 2: EXAM DATE & OBJECTIVES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" /> Fecha del Examen Oficial y Objetivos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Fecha Prevista del Examen (para la cuenta atrás)
            </label>
            <input
              type="date"
              value={settings.examDate || ''}
              onChange={(e) => onUpdateSettings({ examDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Objetivo Diario de Estudio (minutos)
            </label>
            <input
              type="number"
              step="30"
              value={settings.dailyGoalMinutes}
              onChange={(e) => onUpdateSettings({ dailyGoalMinutes: parseInt(e.target.value) || 240 })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              {(settings.dailyGoalMinutes / 60).toFixed(1)} horas al día
            </span>
          </div>
        </div>

        {/* Penalización de examen */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Penalización por Respuesta Incorrecta en Simulacros
          </label>
          <div className="flex items-center gap-3">
            <select
              value={settings.testPenaltyRatio}
              onChange={(e) => onUpdateSettings({ testPenaltyRatio: parseFloat(e.target.value) })}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
            >
              <option value={0.33333}>-1/3 (Oficial AGE: cada 3 fallos restan 1 acierto)</option>
              <option value={0.25}>-1/4 (Cada 4 fallos restan 1 acierto)</option>
              <option value={0.5}>-1/2 (Cada 2 fallos restan 1 acierto)</option>
              <option value={0}>Sin penalización (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: APARIENCIA Y TIPOGRAFÍA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" /> Apariencia y Accesibilidad
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tema Visual
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ darkMode: false })}
                className={`flex-1 p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  !settings.darkMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Sun className="w-4 h-4" /> Modo Claro
              </button>
              <button
                onClick={() => onUpdateSettings({ darkMode: true })}
                className={`flex-1 p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                  settings.darkMode ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'border-slate-200 text-slate-600'
                }`}
              >
                <Moon className="w-4 h-4" /> Modo Oscuro
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tamaño de Letra de Lectura
            </label>
            <div className="flex gap-2">
              {(['small', 'medium', 'large'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => onUpdateSettings({ fontSize: sz })}
                  className={`flex-1 p-2.5 rounded-xl border font-bold capitalize transition ${
                    settings.fontSize === sz
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {sz === 'small' ? 'Pequeña' : sz === 'medium' ? 'Mediana' : 'Grande'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PALETA DE SUBRAYADO CONFIGURABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-amber-500" /> Paleta de Colores de Subrayado
          </h3>
          <span className="text-xs text-slate-400">Totalmente personalizable</span>
        </div>
        <p className="text-xs text-slate-500">
          Personaliza el significado de cada color en el editor de anotaciones:
        </p>

        <div className="space-y-2">
          {settings.highlightPalette.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  style={{ backgroundColor: item.color }}
                  className="w-6 h-6 rounded-lg border border-black/20 flex-shrink-0"
                />
                <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
              </div>

              {editingPaletteIndex === idx ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    defaultValue={item.meaning}
                    id={`palette-input-${idx}`}
                    className="p-1.5 rounded-lg border border-indigo-300 text-xs w-full sm:w-72"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`palette-input-${idx}`) as HTMLInputElement;
                      if (input) updatePaletteMeaning(idx, input.value, item.name);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="text-slate-600 dark:text-slate-400 italic">{item.meaning}</span>
                  <button
                    onClick={() => setEditingPaletteIndex(idx)}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: COPIAS DE SEGURIDAD Y MANTENIMIENTO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" /> Copia de Seguridad y Datos Locales
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => exportDataAsJSON(data)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Exportar Copia Completa (JSON)
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
            <Upload className="w-4 h-4" /> Importar Copia de Seguridad
            <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
          </label>

          <button
            onClick={() => {
              if (confirm('¿Restablecer datos de ejemplo iniciales?')) {
                onResetAllData();
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 transition ml-auto"
          >
            <RotateCcw className="w-4 h-4" /> Restablecer Datos Iniciales
          </button>
        </div>
      </div>
    </div>
  );
};
