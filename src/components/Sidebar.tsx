import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderArchive,
  FileText,
  Lightbulb,
  Layers,
  CheckSquare,
  Star,
  Headphones,
  Calendar,
  BarChart3,
  Scale,
  Settings,
  Plus,
  Sparkles,
  CalendarDays,
  X,
} from 'lucide-react';
import { AppSettings } from '../types';

export type NavSection =
  | 'dashboard'
  | 'syllabus'
  | 'files'
  | 'notes'
  | 'mnemonics'
  | 'flashcards'
  | 'tests'
  | 'askable'
  | 'audio'
  | 'planner'
  | 'stats'
  | 'laws'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  settings: AppSettings;
  onOpenQuickAdd: () => void;
  dueFlashcardsCount: number;
  pendingTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  isOpenMobile,
  onCloseMobile,
  settings,
  onOpenQuickAdd,
  dueFlashcardsCount,
  pendingTasksCount,
}) => {
  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Inicio / Panel', icon: LayoutDashboard },
    { id: 'syllabus' as NavSection, label: 'Temario', icon: BookOpen },
    { id: 'files' as NavSection, label: 'Archivos y enlaces', icon: FolderArchive },
    { id: 'notes' as NavSection, label: 'Anotaciones', icon: FileText },
    { id: 'mnemonics' as NavSection, label: 'Analogías y técnicas', icon: Lightbulb },
    {
      id: 'flashcards' as NavSection,
      label: 'Flashcards (SM-2)',
      icon: Layers,
      badge: dueFlashcardsCount > 0 ? dueFlashcardsCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    { id: 'tests' as NavSection, label: 'Tests y errores', icon: CheckSquare },
    { id: 'askable' as NavSection, label: 'Lo más preguntable', icon: Star },
    { id: 'audio' as NavSection, label: 'Audios y canciones', icon: Headphones },
    {
      id: 'planner' as NavSection,
      label: 'Planificador & Pomodoro',
      icon: Calendar,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-amber-600 text-white',
    },
    { id: 'stats' as NavSection, label: 'Estadísticas', icon: BarChart3 },
    { id: 'laws' as NavSection, label: 'Normativa y recursos', icon: Scale },
    { id: 'settings' as NavSection, label: 'Ajustes', icon: Settings },
  ];

  // Calculate days remaining to exam
  const calculateDaysToExam = (): number | null => {
    if (!settings.examDate) return null;
    const examTime = new Date(settings.examDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  const daysToExam = calculateDaysToExam();

  const handleNavClick = (section: NavSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* App Branding Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  MiOpo
                </span>
                <span className="text-[10px] uppercase font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded tracking-wider">
                  AAE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                Auxiliar Adm. del Estado
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="px-3 pt-3">
          <button
            onClick={onOpenQuickAdd}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir rápido (+)</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      item.badgeColor || 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Countdown Footer Widget */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => handleNavClick('settings')}
            className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-left transition"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Cuenta Atrás Examen</span>
            </div>
            {daysToExam !== null ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {daysToExam}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  días para tu plaza
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Sin fecha fijada (clic para configurar)
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
