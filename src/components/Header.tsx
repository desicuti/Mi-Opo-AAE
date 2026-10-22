import React, { useRef, useEffect } from 'react';
import {
  Search,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  RefreshCw,
  Clock,
  Menu,
  HelpCircle,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AppSettings } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  settings: AppSettings;
  onToggleTheme: () => void;
  onSyncNow: () => void;
  onOpenDriveSettings: () => void;
  onToggleMobileMenu: () => void;
  onTogglePomodoro: () => void;
  onOpenGuide: () => void;
  isPomodoroActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  settings,
  onToggleTheme,
  onSyncNow,
  onOpenDriveSettings,
  onToggleMobileMenu,
  onTogglePomodoro,
  onOpenGuide,
  isPomodoroActive,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync status pill helper
  const renderSyncBadge = () => {
    switch (settings.driveSyncStatus) {
      case 'sincronizado':
        return (
          <button
            onClick={onSyncNow}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
            title={`Sincronizado con Google Drive. Última vez: ${settings.lastSyncTimestamp || 'hace unos momentos'}`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Drive al día</span>
            {settings.lastSyncTimestamp && (
              <span className="text-[10px] opacity-75 hidden md:inline">({settings.lastSyncTimestamp})</span>
            )}
          </button>
        );
      case 'pendiente':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span className="hidden sm:inline">Guardando...</span>
          </div>
        );
      case 'error':
        return (
          <button
            onClick={onOpenDriveSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition"
            title="Error al sincronizar con Drive. Clic para revisar configuración."
          >
            <CloudOff className="w-3.5 h-3.5 text-rose-600" />
            <span>Revisar Drive</span>
          </button>
        );
      case 'sin-conexion':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <CloudOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sin conexión</span>
          </div>
        );
      case 'desconectado':
      default:
        return (
          <button
            onClick={onOpenDriveSettings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100 transition"
            title="Haz clic para conectar con tu Google Drive o configurar tu Client ID"
          >
            <Cloud className="w-3.5 h-3.5 text-indigo-500" />
            <span>Modo Local <span className="hidden md:inline">(Conectar Drive)</span></span>
          </button>
        );
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left side: Hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar en temario, notas, flashcards, errores, leyes... (pulsa /)"
            className="w-full pl-9 pr-8 py-2 rounded-xl text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1"
            >
              ×
            </button>
          )}
          {!searchQuery && (
            <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
              /
            </span>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Drive Sync Pill */}
        {renderSyncBadge()}

        {/* Manual Sync Button if connected */}
        {settings.driveSyncStatus === 'sincronizado' && (
          <button
            onClick={onSyncNow}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Forzar sincronización ahora"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Pomodoro quick toggle */}
        <button
          onClick={onTogglePomodoro}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            isPomodoroActive
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
          }`}
          title="Abrir cronómetro Pomodoro"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Pomodoro</span>
        </button>

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Guide / Help */}
        <button
          onClick={onOpenGuide}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Guía de uso y configuración de Drive"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={settings.darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
};
