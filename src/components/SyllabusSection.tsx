import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Topic, AppData } from '../types';
import { INITIAL_BLOCKS } from '../data/initialData';

interface SyllabusSectionProps {
  data: AppData;
  onSelectTopic: (topicId: string) => void;
  onAddTopic: (topic: Partial<Topic>) => void;
}

export const SyllabusSection: React.FC<SyllabusSectionProps> = ({
  data,
  onSelectTopic,
  onAddTopic,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicShortTitle, setNewTopicShortTitle] = useState('');
  const [newTopicBlock, setNewTopicBlock] = useState<'bloque-1' | 'bloque-2' | 'bloque-3'>('bloque-3');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  // Filter topics
  const filteredTopics = data.topics.filter((topic) => {
    if (selectedBlock !== 'todos' && topic.blockId !== selectedBlock) return false;
    if (selectedStatus !== 'todos' && topic.status !== selectedStatus) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = topic.title.toLowerCase().includes(q);
      const matchShort = topic.shortTitle.toLowerCase().includes(q);
      const matchTags = topic.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchShort && !matchTags) return false;
    }
    return true;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    const blockTopics = data.topics.filter((t) => t.blockId === newTopicBlock);
    const newNumber = blockTopics.length + 1;

    onAddTopic({
      id: `custom-${Date.now()}`,
      blockId: newTopicBlock,
      number: newNumber,
      title: newTopicTitle.trim(),
      shortTitle: newTopicShortTitle.trim() || `Tema ${newNumber}: ${newTopicTitle.slice(0, 20)}...`,
      description: newTopicDesc.trim() || 'Subtema personalizado.',
      status: 'sin-empezar',
      progress: 0,
      tags: ['Personalizado'],
      studyMinutesTotal: 0,
    });

    setNewTopicTitle('');
    setNewTopicShortTitle('');
    setNewTopicDesc('');
    setShowAddModal(false);
  };

  const getStatusBadge = (status: Topic['status']) => {
    switch (status) {
      case 'dominado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Dominado</span>;
      case 'repasado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">Repasado</span>;
      case 'estudiado':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Estudiado</span>;
      case 'estudiando':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Estudiando</span>;
      case 'sin-empezar':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">Sin empezar</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" /> Temario Oficial AAE
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            36 temas oficiales precargados. Haz clic en cualquier tema para abrir sus 9 pestañas de estudio.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Añadir Tema / Subtema
        </button>
      </div>

      {/* Block Selector Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedBlock('todos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
            selectedBlock === 'todos'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          Todos los Bloques (36)
        </button>
        {INITIAL_BLOCKS.map((blk) => (
          <button
            key={blk.id}
            onClick={() => setSelectedBlock(blk.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedBlock === blk.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {blk.shortTitle}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar por título o etiqueta..."
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Estado:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="sin-empezar">Sin empezar</option>
            <option value="estudiando">Estudiando</option>
            <option value="estudiado">Estudiado</option>
            <option value="repasado">Repasado</option>
            <option value="dominado">Dominado</option>
          </select>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {topic.shortTitle}
                </span>
                {getStatusBadge(topic.status)}
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {topic.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {topic.description}
              </p>
            </div>

            {/* Bottom Progress Bar & Tags */}
            <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round((topic.studyMinutesTotal || 0) / 60)}h dedicadas
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  {topic.progress}%
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${topic.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1 max-w-[80%]">
                  {topic.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                  {topic.tags.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{topic.tags.length - 2}</span>
                  )}
                </div>

                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center group-hover:translate-x-0.5 transition">
                  Ver fichas <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Añadir Nuevo Tema o Subtema
            </h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Bloque
                </label>
                <select
                  value={newTopicBlock}
                  onChange={(e) => setNewTopicBlock(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="bloque-1">Bloque 1 – Organización Pública</option>
                  <option value="bloque-2">Bloque 2 – Actividad Administrativa y Ofimática</option>
                  <option value="bloque-3">Bloque 3 – Psicotécnicos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título Completo del Tema
                </label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Ej: Razonamiento espacial y figuras tridimensionales"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título Corto (para tarjetas)
                </label>
                <input
                  type="text"
                  value={newTopicShortTitle}
                  onChange={(e) => setNewTopicShortTitle(e.target.value)}
                  placeholder="Ej: Psicotécnicos: Figuras 3D"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Descripción o Subtemas
                </label>
                <textarea
                  rows={3}
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder="Puntos clave que abarca este tema..."
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Guardar Tema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
