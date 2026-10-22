import React, { useState } from 'react';
import {
  Flame,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  Edit2,
  ChevronRight,
  TrendingUp,
  Award,
  CheckSquare,
} from 'lucide-react';
import { AppData, Task } from '../types';
import { INITIAL_BLOCKS } from '../data/initialData';
import { NavSection } from './Sidebar';

interface DashboardProps {
  data: AppData;
  onNavigate: (section: NavSection, filter?: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onUpdateQuote: (newQuote: string) => void;
  onSelectTopic: (topicId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onNavigate,
  onToggleTaskStatus,
  onUpdateQuote,
  onSelectTopic,
}) => {
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [editedQuote, setEditedQuote] = useState(
    data.settings.motivationalQuotes[data.settings.activeQuoteIndex] || ''
  );

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Tasks due today
  const todaysTasks = data.tasks.filter((t) => t.date === todayStr);

  // Due flashcards count
  const todayEndTime = new Date().setHours(23, 59, 59, 999);
  const dueFlashcards = data.flashcards.filter((f) => {
    if (!f.nextReview) return true;
    return new Date(f.nextReview).getTime() <= todayEndTime;
  });

  // Topics due for spaced repetition review today
  const topicsDueForReview = data.topics.filter(
    (t) => t.nextReviewDate && t.nextReviewDate <= todayStr
  );

  // Total study minutes this week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const minutesThisWeek = data.studyLogs
    .filter((log) => log.date >= sevenDaysAgoStr)
    .reduce((acc, log) => acc + log.minutes, 0);

  const hoursThisWeek = (minutesThisWeek / 60).toFixed(1);

  // Calculate days to exam
  const calculateDaysToExam = (): number | null => {
    if (!data.settings.examDate) return null;
    const examTime = new Date(data.settings.examDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((examTime - nowTime) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : null;
  };

  const daysToExam = calculateDaysToExam();

  // Progress by block
  const getBlockProgress = (blockId: 'bloque-1' | 'bloque-2' | 'bloque-3') => {
    const blockTopics = data.topics.filter((t) => t.blockId === blockId);
    if (blockTopics.length === 0) return 0;
    const totalProgress = blockTopics.reduce((sum, t) => sum + (t.progress || 0), 0);
    return Math.round(totalProgress / blockTopics.length);
  };

  // Status breakdown count
  const statusCounts = {
    'sin-empezar': data.topics.filter((t) => t.status === 'sin-empezar').length,
    estudiando: data.topics.filter((t) => t.status === 'estudiando').length,
    estudiado: data.topics.filter((t) => t.status === 'estudiado').length,
    repasado: data.topics.filter((t) => t.status === 'repasado').length,
    dominado: data.topics.filter((t) => t.status === 'dominado').length,
  };

  const totalTopics = data.topics.length;
  const masteredPercentage = Math.round(
    ((statusCounts.dominado + statusCounts.repasado + statusCounts.estudiado) / totalTopics) * 100
  );

  // Cycle to next quote
  const nextRandomQuote = () => {
    const quotes = data.settings.motivationalQuotes;
    const nextIdx = (data.settings.activeQuoteIndex + 1) % quotes.length;
    data.settings.activeQuoteIndex = nextIdx;
    setEditedQuote(quotes[nextIdx]);
  };

  const handleSaveQuote = () => {
    if (editedQuote.trim()) {
      onUpdateQuote(editedQuote.trim());
      setIsEditingQuote(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Motivational Banner & Daily Spark */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tu frase del día</span>
            </div>

            {isEditingQuote ? (
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <input
                  type="text"
                  value={editedQuote}
                  onChange={(e) => setEditedQuote(e.target.value)}
                  className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
                />
                <button
                  onClick={handleSaveQuote}
                  className="px-4 py-2 bg-amber-400 text-slate-950 rounded-xl font-bold text-xs hover:bg-amber-300 transition whitespace-nowrap"
                >
                  Guardar
                </button>
              </div>
            ) : (
              <p className="text-base md:text-xl font-medium italic text-slate-100 leading-relaxed">
                {data.settings.motivationalQuotes[data.settings.activeQuoteIndex] ||
                  '«Cada hora de estudio hoy es un paso más cerca de tu plaza en el BOE.»'}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={nextRandomQuote}
                className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 transition"
                title="Mostrar otra frase motivadora"
              >
                <RefreshCw className="w-3 h-3" /> Otra frase
              </button>
              <button
                onClick={() => setIsEditingQuote(!isEditingQuote)}
                className="text-xs text-indigo-200 hover:text-white flex items-center gap-1 transition"
                title="Editar esta frase"
              >
                <Edit2 className="w-3 h-3" /> Editar frase
              </button>
            </div>
          </div>

          {/* Exam Countdown Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 md:p-5 flex-shrink-0 text-center min-w-[200px]">
            <span className="text-xs uppercase tracking-wider text-indigo-200 font-bold block mb-1">
              Cuenta atrás oficial
            </span>
            {daysToExam !== null ? (
              <div>
                <span className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white block">
                  {daysToExam}
                </span>
                <span className="text-xs text-amber-300 font-medium">días para el examen</span>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-semibold transition mt-1 block"
              >
                Configurar fecha
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Racha de estudio</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {data.settings.streakDays || 1}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">días seguidos</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ¡Sigue así, constancia pura!
          </p>
        </div>

        {/* Hours This Week */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Esta semana</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {hoursThisWeek}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">horas reales</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Objetivo: {(data.settings.dailyGoalMinutes * 7 / 60).toFixed(0)}h / semana
          </p>
        </div>

        {/* Due Flashcards */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Flashcards hoy</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {dueFlashcards.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">pendientes (SM-2)</span>
          </div>
          <button
            onClick={() => onNavigate('flashcards')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline mt-1 flex items-center gap-1"
          >
            Repasar ahora <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Temario Dominado */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Temas avanzados</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {masteredPercentage}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">del temario total</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {statusCounts.dominado + statusCounts.repasado + statusCounts.estudiado} de {totalTopics} temas estudiados
          </p>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Pending Reviews vs Block Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tareas de Hoy & Repasos programados */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tareas de Hoy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Plan de Estudio para Hoy ({todaysTasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Abrir Planificador <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                <p>No tienes tareas programadas para hoy.</p>
                <button
                  onClick={() => onNavigate('planner')}
                  className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition"
                >
                  + Programar sesión de hoy
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todaysTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      task.status === 'completada'
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleTaskStatus(task.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
                          task.status === 'completada'
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-600'
                        }`}
                      >
                        {task.status === 'completada' && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            task.status === 'completada'
                              ? 'text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span>⏱ {task.durationMinutes} min</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              task.priority === 'alta'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Repasos Espaciados Programados para Hoy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Temas para Repasar Hoy ({topicsDueForReview.length})
                </h3>
              </div>
            </div>

            {topicsDueForReview.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-3">
                ¡Al día! No hay temas que requieran repaso programado para hoy.
              </p>
            ) : (
              <div className="space-y-2">
                {topicsDueForReview.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => onSelectTopic(topic.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 hover:bg-amber-100/60 cursor-pointer transition"
                  >
                    <div>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {topic.shortTitle}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                        {topic.title}
                      </p>
                    </div>
                    <button className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs">
                      Repasar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Barras de Progreso por Bloque & Accesos Rápidos */}
        <div className="space-y-6">
          {/* Progress by Block */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4">
              Progreso por Bloque
            </h3>
            <div className="space-y-4">
              {INITIAL_BLOCKS.map((block) => {
                const prog = getBlockProgress(block.id);
                return (
                  <div key={block.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {block.shortTitle}
                      </span>
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                        {prog}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          block.id === 'bloque-1'
                            ? 'bg-indigo-600'
                            : block.id === 'bloque-2'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      {block.badge}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigate('syllabus')}
              className="mt-5 w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              Explorar Temario Completo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Topics by Status breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3">
              Estado de los 36 Temas
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sin empezar</span>
                <span className="text-lg font-black text-slate-700 dark:text-slate-300 font-mono">
                  {statusCounts['sin-empezar']}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900">
                <span className="text-blue-500 block text-[10px] uppercase font-semibold">Estudiando</span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-300 font-mono">
                  {statusCounts.estudiando}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900">
                <span className="text-indigo-500 block text-[10px] uppercase font-semibold">Estudiado</span>
                <span className="text-lg font-black text-indigo-700 dark:text-indigo-300 font-mono">
                  {statusCounts.estudiado}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900">
                <span className="text-emerald-500 block text-[10px] uppercase font-semibold">Dominado</span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
                  {statusCounts.dominado + statusCounts.repasado}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
