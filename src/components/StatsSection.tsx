import React from 'react';
import {
  BarChart3,
  Flame,
  Award,
  Layers,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { AppData } from '../types';

interface StatsSectionProps {
  data: AppData;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ data }) => {
  // Total study minutes from all logs
  const totalMinutes = data.studyLogs.reduce((acc, log) => acc + log.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Status breakdown
  const statusCounts = {
    'sin-empezar': data.topics.filter((t) => t.status === 'sin-empezar').length,
    estudiando: data.topics.filter((t) => t.status === 'estudiando').length,
    estudiado: data.topics.filter((t) => t.status === 'estudiado').length,
    repasado: data.topics.filter((t) => t.status === 'repasado').length,
    dominado: data.topics.filter((t) => t.status === 'dominado').length,
  };

  // Flashcards retention rate
  const totalReviews = data.flashcards.reduce((sum, f) => sum + (f.reviewCount || 0), 0);
  const totalFails = data.flashcards.reduce((sum, f) => sum + (f.failCount || 0), 0);
  const retentionRate =
    totalReviews > 0 ? Math.round(((totalReviews - totalFails) / totalReviews) * 100) : 88;

  // Most failed topics
  const topicErrorCounts: Record<string, number> = {};
  data.failedQuestions.forEach((q) => {
    topicErrorCounts[q.topicId] = (topicErrorCounts[q.topicId] || 0) + 1;
  });

  const sortedFailedTopics = Object.entries(topicErrorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([topicId, count]) => {
      const topicObj = data.topics.find((t) => t.id === topicId);
      return {
        topicId,
        count,
        title: topicObj?.shortTitle || topicId,
      };
    });

  // Heatmap generation for last 90 days
  const today = new Date();
  const heatmapDays: { dateStr: string; minutes: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const logForDay = data.studyLogs.filter((l) => l.date === dateStr);
    const mins = logForDay.reduce((sum, l) => sum + l.minutes, 0);
    heatmapDays.push({ dateStr, minutes: mins });
  }

  const getHeatmapColor = (mins: number) => {
    if (mins === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (mins < 60) return 'bg-indigo-200 dark:bg-indigo-950';
    if (mins < 120) return 'bg-indigo-400 dark:bg-indigo-800';
    if (mins < 180) return 'bg-indigo-600 dark:bg-indigo-600';
    return 'bg-indigo-800 dark:bg-indigo-400';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" /> Estadísticas y Rendimiento
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Métricas objetivas de constancia, retención de memoria y evolución hacia tu plaza en la AAE.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Horas Totales Estudiadas</span>
          <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {totalHours}h
          </span>
          <p className="text-[11px] text-slate-500">Registradas en el sistema</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Racha Actual</span>
          <span className="text-3xl font-black font-mono text-amber-500 flex items-center gap-1">
            <Flame className="w-6 h-6 fill-amber-500 inline" /> {data.settings.streakDays || 1} días
          </span>
          <p className="text-[11px] text-slate-500">¡Hábito inquebrantable!</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Retención Flashcards</span>
          <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {retentionRate}%
          </span>
          <p className="text-[11px] text-slate-500">Tasa de aciertos SM-2</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Simulacros Realizados</span>
          <span className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
            {data.mockExams.length}
          </span>
          <p className="text-[11px] text-slate-500">En condiciones de examen</p>
        </div>
      </div>

      {/* Activity Heatmap Grid (90 Days) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Mapa de Calor de Actividad (Últimos 90 días)
          </h3>
          <span className="text-xs text-slate-400">Constancia diaria</span>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          {heatmapDays.map((d) => (
            <div
              key={d.dateStr}
              className={`w-3.5 h-3.5 rounded-sm transition ${getHeatmapColor(d.minutes)}`}
              title={`${d.dateStr}: ${d.minutes} minutos estudiados`}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 pt-1">
          <span>Menos</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-slate-100 dark:bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-xs bg-indigo-200" />
          <div className="w-2.5 h-2.5 rounded-xs bg-indigo-400" />
          <div className="w-2.5 h-2.5 rounded-xs bg-indigo-600" />
          <div className="w-2.5 h-2.5 rounded-xs bg-indigo-800" />
          <span>Más tiempo</span>
        </div>
      </div>

      {/* Two Columns: Temas por Estado & Temas Más Fallados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" /> Estado de los 36 Temas Oficiales
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-600">Dominados ({statusCounts.dominado})</span>
                <span className="font-mono text-slate-500">
                  {Math.round((statusCounts.dominado / 36) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(statusCounts.dominado / 36) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-teal-600">Repasados ({statusCounts.repasado})</span>
                <span className="font-mono text-slate-500">
                  {Math.round((statusCounts.repasado / 36) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${(statusCounts.repasado / 36) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-indigo-600">Estudiados ({statusCounts.estudiado})</span>
                <span className="font-mono text-slate-500">
                  {Math.round((statusCounts.estudiado / 36) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(statusCounts.estudiado / 36) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-blue-600">Estudiando ({statusCounts.estudiando})</span>
                <span className="font-mono text-slate-500">
                  {Math.round((statusCounts.estudiando / 36) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(statusCounts.estudiando / 36) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-500">Sin empezar ({statusCounts['sin-empezar']})</span>
                <span className="font-mono text-slate-500">
                  {Math.round((statusCounts['sin-empezar'] / 36) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-300 dark:bg-slate-700 rounded-full"
                  style={{ width: `${(statusCounts['sin-empezar'] / 36) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Most Failed Topics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" /> Temas con Más Fallos en Tests
          </h3>

          {sortedFailedTopics.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No hay fallos registrados todavía. A medida que hagas simulacros verás aquí dónde necesitas reforzar.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedFailedTopics.map((item, idx) => (
                <div
                  key={item.topicId}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px]">
                    {item.count} fallos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
