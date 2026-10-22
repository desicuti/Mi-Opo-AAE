import React, { useState } from 'react';
import {
  Star,
  CheckCircle,
  Plus,
  Filter,
  Eye,
  EyeOff,
  Flame,
  Search,
  Sparkles,
} from 'lucide-react';
import { AskableItem, AppData } from '../types';

interface MostAskableProps {
  data: AppData;
  activeTopicId?: string;
  onToggleMastered: (id: string) => void;
  onAddAskable: (item: AskableItem) => void;
}

export const MostAskableSection: React.FC<MostAskableProps> = ({
  data,
  activeTopicId,
  onToggleMastered,
  onAddAskable,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>(activeTopicId || 'todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickReviewMode, setQuickReviewMode] = useState(false);
  const [hiddenDetailsMap, setHiddenDetailsMap] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item State
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newCategory, setNewCategory] = useState<AskableItem['category']>('plazo');
  const [newStars, setNewStars] = useState<1 | 2 | 3>(3);
  const [newTopicId, setNewTopicId] = useState(data.topics[0]?.id || 'b1-t11');
  const [newLaw, setNewLaw] = useState('');

  // Filter items
  const filteredItems = data.askableItems.filter((item) => {
    if (selectedTopic !== 'todos' && item.topicId !== selectedTopic) return false;
    if (selectedCategory !== 'todos' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDetails = item.details.toLowerCase().includes(q);
      const matchLaw = item.lawReference?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDetails && !matchLaw) return false;
    }
    return true;
  });

  // Sort by star rating descending, then unmastered first
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.mastered !== b.mastered) return a.mastered ? 1 : -1;
    return b.stars - a.stars;
  });

  const toggleHide = (id: string) => {
    setHiddenDetailsMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDetails.trim()) return;

    const created: AskableItem = {
      id: `ask-${Date.now()}`,
      topicId: newTopicId,
      category: newCategory,
      title: newTitle.trim(),
      details: newDetails.trim(),
      stars: newStars,
      mastered: false,
      lawReference: newLaw.trim() || undefined,
    };

    onAddAskable(created);
    setShowAddModal(false);
    setNewTitle('');
    setNewDetails('');
    setNewLaw('');
  };

  const masteredCount = data.askableItems.filter((i) => i.mastered).length;
  const totalCount = data.askableItems.length;
  const masteredPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Lo Más Preguntable del Examen
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plazos críticos, mayorías de reforma, órganos competentes y números que caen año tras año.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setQuickReviewMode(!quickReviewMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              quickReviewMode
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {quickReviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{quickReviewMode ? 'Modo Tarjetas' : 'Modo Repaso Rápido'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Añadir Dato
          </button>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950">
            <Flame className="w-5 h-5 fill-slate-950" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Nivel de Dominio de Datos Clave
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {masteredCount} de {totalCount} datos clave ya dominados ({masteredPercent}%)
            </p>
          </div>
        </div>
        <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
          {masteredPercent}%
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por artículo, plazo, órgano..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="todos">Todos los temas</option>
            {data.topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortTitle}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value="todos">Todas las categorías</option>
            <option value="plazo">Plazos</option>
            <option value="mayoria">Mayorías</option>
            <option value="organo">Órganos</option>
            <option value="numero">Números y Cantidades</option>
            <option value="articulo">Artículos Clave</option>
            <option value="excepcion">Excepciones</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {sortedItems.map((item) => {
          const isHidden = hiddenDetailsMap[item.id] ?? quickReviewMode;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition shadow-xs ${
                item.mastered
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-white dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/50'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    {item.category}
                  </span>
                  <span className="text-amber-500 font-bold text-xs" title={`Importancia: ${item.stars} estrellas`}>
                    {'★'.repeat(item.stars)}
                  </span>
                  {item.lawReference && (
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      📜 {item.lawReference}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {quickReviewMode && (
                    <button
                      onClick={() => toggleHide(item.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isHidden ? 'Ver respuesta' : 'Ocultar'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onToggleMastered(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      item.mastered
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{item.mastered ? '¡Ya lo sé!' : 'Marcar como aprendido'}</span>
                  </button>
                </div>
              </div>

              <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h3>

              {!isHidden ? (
                <div className="mt-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 leading-relaxed font-sans">
                  {item.details}
                </div>
              ) : (
                <div
                  onClick={() => toggleHide(item.id)}
                  className="mt-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition text-center select-none"
                >
                  [Dato oculto en modo repaso rápido — Haz clic para revelar]
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Añadir Dato Preguntable */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Añadir Dato Altamente Preguntable
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Tema Asociado
                </label>
                <select
                  value={newTopicId}
                  onChange={(e) => setNewTopicId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.shortTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="plazo">Plazo</option>
                    <option value="mayoria">Mayoría</option>
                    <option value="organo">Órgano</option>
                    <option value="numero">Número / Cantidad</option>
                    <option value="articulo">Artículo</option>
                    <option value="excepcion">Excepción</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Nivel de Importancia
                  </label>
                  <select
                    value={newStars}
                    onChange={(e) => setNewStars(parseInt(e.target.value) as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-500"
                  >
                    <option value={3}>★★★ Imprescindible (Cae siempre)</option>
                    <option value={2}>★★ Muy Preguntable</option>
                    <option value={1}>★ Preguntable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título / Concepto Preguntable
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Plazo para interponer recurso contencioso-administrativo"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Respuesta Exacta y Matices
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Ej: 2 meses si el acto es expreso. 6 meses si es presunto (aunque jurisprudencia del TC...)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Referencia Legal (artículo o ley)
                </label>
                <input
                  type="text"
                  value={newLaw}
                  onChange={(e) => setNewLaw(e.target.value)}
                  placeholder="Ej: Art. 46 LJCA 29/1998"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
