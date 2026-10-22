import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  Trash2,
  Download,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { Task, AppData } from '../types';
import { exportCalendarToICS } from '../services/db';
import { PomodoroWidget } from './PomodoroWidget';

interface PlannerSectionProps {
  data: AppData;
  activeTopicId?: string;
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onLogStudySession: (minutes: number, topicId?: string) => void;
  onScheduleSpacedRepetition: (topicId: string) => void;
}

export const PlannerSection: React.FC<PlannerSectionProps> = ({
  data,
  activeTopicId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onLogStudySession,
  onScheduleSpacedRepetition,
}) => {
  const [plannerView, setPlannerView] = useState<'diaria' | 'semanal' | 'mensual' | 'anual'>('semanal');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // New Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState(45);
  const [newPriority, setNewPriority] = useState<Task['priority']>('alta');
  const [newType, setNewType] = useState<Task['type']>('estudio');
  const [newTaskDate, setNewTaskDate] = useState(selectedDate);
  const [newTopicId, setNewTopicId] = useState(activeTopicId || data.topics[0]?.id || 'b1-t1');

  // Today string
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to compute dates of current week (Monday to Sunday)
  const getWeekDates = (baseDateStr: string) => {
    const base = new Date(baseDateStr);
    const day = base.getDay();
    // In JS Sunday=0, Monday=1
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diffToMonday);

    const week: { dateStr: string; dayName: string; dayNumber: number }[] = [];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: dayNames[i],
        dayNumber: d.getDate(),
      });
    }
    return week;
  };

  const currentWeek = getWeekDates(selectedDate);

  // Move week forward/back
  const changeWeek = (daysOffset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + daysOffset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      date: newTaskDate,
      durationMinutes: Number(newDuration),
      priority: newPriority,
      status: 'pendiente',
      type: newType,
      topicId: newTopicId,
    };

    onAddTask(task);
    setShowAddTaskModal(false);
    setNewTitle('');
  };

  // Populate Weekly Study Template (Default: Mon: Psicotecnicos, Tue/Wed: Leyes, Thu/Fri: Informatica, Sat/Sun: Repaso)
  const applyWeeklyTemplate = () => {
    const templateTasks: Task[] = [];
    const week = getWeekDates(selectedDate);

    // Monday: Psicotécnicos
    templateTasks.push({
      id: `task-tpl-1-${Date.now()}`,
      title: 'Batería de Psicotécnicos (Numéricos y Series)',
      date: week[0].dateStr,
      durationMinutes: 90,
      priority: 'alta',
      status: 'pendiente',
      type: 'psicotecnico',
      topicId: 'b3-t1',
    });

    // Tuesday: Leyes Bloque 1
    templateTasks.push({
      id: `task-tpl-2-${Date.now()}`,
      title: 'Estudio intensivo Ley 39/2015 (Procedimiento Común)',
      date: week[1].dateStr,
      durationMinutes: 120,
      priority: 'alta',
      status: 'pendiente',
      type: 'estudio',
      topicId: 'b1-t11',
    });

    // Wednesday: Leyes Bloque 1
    templateTasks.push({
      id: `task-tpl-3-${Date.now()}`,
      title: 'Repaso de Constitución Española y Garantías (Título I)',
      date: week[2].dateStr,
      durationMinutes: 90,
      priority: 'alta',
      status: 'pendiente',
      type: 'repaso',
      topicId: 'b1-t1',
    });

    // Thursday: Ofimática Word
    templateTasks.push({
      id: `task-tpl-4-${Date.now()}`,
      title: 'Word 365: Cinta de opciones, atajos y tabulaciones',
      date: week[3].dateStr,
      durationMinutes: 90,
      priority: 'media',
      status: 'pendiente',
      type: 'estudio',
      topicId: 'b2-t8',
    });

    // Friday: Ofimática Excel
    templateTasks.push({
      id: `task-tpl-5-${Date.now()}`,
      title: 'Excel 365: Fórmulas relativas vs absolutas y funciones',
      date: week[4].dateStr,
      durationMinutes: 90,
      priority: 'media',
      status: 'pendiente',
      type: 'estudio',
      topicId: 'b2-t9',
    });

    // Saturday: Simulacro
    templateTasks.push({
      id: `task-tpl-6-${Date.now()}`,
      title: 'Simulacro General de Examen (70 preguntas contrarreloj)',
      date: week[5].dateStr,
      durationMinutes: 80,
      priority: 'alta',
      status: 'pendiente',
      type: 'simulacro',
      topicId: 'b1-t11',
    });

    // Sunday: Repaso general de flashcards
    templateTasks.push({
      id: `task-tpl-7-${Date.now()}`,
      title: 'Repaso general semanal de flashcards y corrección de errores',
      date: week[6].dateStr,
      durationMinutes: 60,
      priority: 'media',
      status: 'pendiente',
      type: 'repaso',
    });

    templateTasks.forEach((t) => onAddTask(t));
    setShowTemplateModal(false);
  };

  // Weekly study hours calculation
  const totalPlannedMinutes = currentWeek.reduce((sum, day) => {
    const dayTasks = data.tasks.filter((t) => t.date === day.dateStr);
    return sum + dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
  }, 0);

  const completedMinutes = currentWeek.reduce((sum, day) => {
    const dayTasks = data.tasks.filter((t) => t.date === day.dateStr && t.status === 'completada');
    return sum + dayTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
  }, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Planificador y Pomodoro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organiza tus semanas de estudio, aplica la plantilla semanal recomendada y sincroniza con Google Calendar (.ics).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportCalendarToICS(data)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Exportar a Google Calendar / Apple Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar a Google Calendar (.ics)</span>
          </button>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> Plantilla Semanal
          </button>

          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Añadir Tarea
          </button>
        </div>
      </div>

      {/* View Switcher: Diaria / Semanal / Mensual / Anual */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          {(['diaria', 'semanal', 'mensual', 'anual'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setPlannerView(view)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                plannerView === view
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeWeek(-7)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold font-mono px-2">
            Semana del {currentWeek[0]?.dateStr} al {currentWeek[6]?.dateStr}
          </span>
          <button
            onClick={() => changeWeek(7)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Planner Schedule & Floating Pomodoro */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar Views */}
        <div className="lg:col-span-8 space-y-4">
          {/* SEMANAL VIEW (Default) */}
          {plannerView === 'semanal' && (
            <div className="space-y-4">
              {/* Summary of weekly balance */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Balance Semanal: {(completedMinutes / 60).toFixed(1)}h estudiadas de{' '}
                    {(totalPlannedMinutes / 60).toFixed(1)}h planificadas
                  </span>
                </div>
                <span className="font-mono font-bold text-indigo-600">
                  {totalPlannedMinutes > 0
                    ? Math.round((completedMinutes / totalPlannedMinutes) * 100)
                    : 0}
                  %
                </span>
              </div>

              {/* 7 Day Columns */}
              <div className="space-y-3">
                {currentWeek.map((day) => {
                  const dayTasks = data.tasks.filter((t) => t.date === day.dateStr);
                  const isToday = day.dateStr === todayStr;

                  return (
                    <div
                      key={day.dateStr}
                      className={`p-4 rounded-2xl border transition ${
                        isToday
                          ? 'bg-white dark:bg-slate-900 border-indigo-400 dark:border-indigo-600 shadow-sm ring-1 ring-indigo-400'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isToday
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {day.dayNumber}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {day.dayName} {isToday && '(Hoy)'}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setNewTaskDate(day.dateStr);
                            setShowAddTaskModal(true);
                          }}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Añadir tarea
                        </button>
                      </div>

                      {/* Tasks of this day */}
                      {dayTasks.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-1">Sin tareas programadas.</p>
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          {dayTasks.map((t) => (
                            <div
                              key={t.id}
                              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                                t.status === 'completada'
                                  ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 line-through text-slate-400'
                                  : 'bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate max-w-[80%]">
                                <button
                                  onClick={() =>
                                    onUpdateTask({
                                      ...t,
                                      status: t.status === 'completada' ? 'pendiente' : 'completada',
                                      completedAt:
                                        t.status === 'completada' ? undefined : new Date().toISOString(),
                                    })
                                  }
                                  className={`w-4 h-4 rounded flex items-center justify-center ${
                                    t.status === 'completada'
                                      ? 'bg-emerald-500 text-white'
                                      : 'border border-slate-300'
                                  }`}
                                >
                                  {t.status === 'completada' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </button>
                                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {t.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-[10px] font-mono text-slate-400">
                                  ⏱ {t.durationMinutes}m
                                </span>
                                <button
                                  onClick={() => onDeleteTask(t.id)}
                                  className="text-slate-300 hover:text-rose-500"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DIARIA VIEW */}
          {plannerView === 'diaria' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Día Seleccionado: {selectedDate}
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="space-y-2">
                {data.tasks
                  .filter((t) => t.date === selectedDate)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {t.title}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{t.durationMinutes} min</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ANUAL VIEW (Hitos y Examen) */}
          {plannerView === 'anual' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Vista Anual de Hitos y Metas
              </h3>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-950">
                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                    1
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex-1">
                    <span className="text-xs font-bold text-indigo-600 block">Hito 1: Primera Vuelta al Temario</span>
                    <p className="text-xs text-slate-500 mt-0.5">Completar la lectura y esquemas de los Bloques 1, 2 y 3.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                    2
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex-1">
                    <span className="text-xs font-bold text-purple-600 block">Hito 2: Vuelta de Consolidación y Test</span>
                    <p className="text-xs text-slate-500 mt-0.5">Alcanzar &gt;80% de aciertos en simulacros y consolidar flashcards SM-2.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center flex-shrink-0 z-10 shadow-xs">
                    🎯
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 flex-1">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                      Hito Final: Día del Examen Oficial AAE
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {data.settings.examDate ? `Fecha programada: ${data.settings.examDate}` : 'Configura la fecha en Ajustes para ver la cuenta regresiva.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MENSUAL VIEW */}
          {plannerView === 'mensual' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs text-center text-xs text-slate-500">
              <p>Visualizando el mes en curso. Cambia a vista semanal para gestionar tareas individuales.</p>
            </div>
          )}
        </div>

        {/* Right Column: Pomodoro Timer Integration */}
        <div className="lg:col-span-4 space-y-4">
          <PomodoroWidget
            workMinutes={data.settings.pomodoro.workMinutes}
            breakMinutes={data.settings.pomodoro.breakMinutes}
            soundEnabled={data.settings.pomodoro.soundEnabled}
            onSessionComplete={(mins) => onLogStudySession(mins, activeTopicId)}
          />

          {/* Spaced Repetition Auto-Generator Trigger */}
          <div className="p-5 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
            <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Generador de Repasos (+1, +7, +21, +45 días)
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              ¿Has terminado de estudiar un tema hoy? Selecciona el tema para agendar sus 4 repasos espaciados automáticamente.
            </p>
            <div className="flex gap-2 pt-1">
              <select
                id="sr-topic-picker"
                className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 truncate"
              >
                {data.topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.shortTitle}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const el = document.getElementById('sr-topic-picker') as HTMLSelectElement;
                  if (el) {
                    onScheduleSpacedRepetition(el.value);
                    alert('¡Se han programado 4 repasos en tu calendario!');
                  }
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-indigo-700 shadow-xs"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Añadir Tarea */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Nueva Tarea en el Planificador
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título de la Tarea
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Repasar Art. 14 a 29 CE y hacer 20 preguntas test"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    required
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tipo de Actividad
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="estudio">Estudio de tema</option>
                    <option value="repaso">Repaso</option>
                    <option value="test">Batería de tests</option>
                    <option value="psicotecnico">Psicotécnicos</option>
                    <option value="simulacro">Simulacro oficial</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Guardar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Plantilla Semanal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Aplicar Plantilla Semanal Recomendada
            </h3>
            <p className="text-xs text-slate-500">
              Esta plantilla distribuye equilibradamente la semana del {currentWeek[0]?.dateStr}:
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
              <li><strong>Lunes:</strong> Psicotécnicos intensivos</li>
              <li><strong>Martes y Miércoles:</strong> Leyes y Procedimiento Administrativo</li>
              <li><strong>Jueves y Viernes:</strong> Informática y Ofimática (Word / Excel)</li>
              <li><strong>Sábado:</strong> Simulacro general contrarreloj</li>
              <li><strong>Domingo:</strong> Repaso de flashcards y fallos de la semana</li>
            </ul>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={applyWeeklyTemplate}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
              >
                Aplicar a esta semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
