import React, { useState } from 'react';
import {
  X,
  FileText,
  Layers,
  AlertCircle,
  Calendar,
  Star,
  Plus,
} from 'lucide-react';
import { AppData, Note, Flashcard, FailedQuestion, Task, AskableItem } from '../types';

interface QuickAddModalProps {
  data: AppData;
  onClose: () => void;
  onAddNote: (note: Note) => void;
  onAddFlashcard: (fc: Flashcard) => void;
  onAddError: (err: FailedQuestion) => void;
  onAddTask: (task: Task) => void;
  onAddAskable: (askable: AskableItem) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  data,
  onClose,
  onAddNote,
  onAddFlashcard,
  onAddError,
  onAddTask,
  onAddAskable,
}) => {
  const [activeType, setActiveType] = useState<
    'note' | 'flashcard' | 'error' | 'task' | 'askable'
  >('note');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Flashcard form state
  const [fcFront, setFcFront] = useState('');
  const [fcBack, setFcBack] = useState('');
  const [fcTopic, setFcTopic] = useState(data.topics[0]?.id || 'b1-t11');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDuration, setTaskDuration] = useState(45);

  // Askable form state
  const [askTitle, setAskTitle] = useState('');
  const [askDetails, setAskDetails] = useState('');
  const [askCategory, setAskCategory] = useState<AskableItem['category']>('plazo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === 'note') {
      if (!noteTitle.trim()) return;
      onAddNote({
        id: `note-${Date.now()}`,
        title: noteTitle.trim(),
        contentHtml: `<p>${noteContent.trim() || 'Nota rápida...'}</p>`,
        folder: 'Notas Rápidas',
        tags: ['Rápida'],
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (activeType === 'flashcard') {
      if (!fcFront.trim() || !fcBack.trim()) return;
      onAddFlashcard({
        id: `fc-${Date.now()}`,
        topicId: fcTopic,
        front: fcFront.trim(),
        back: fcBack.trim(),
        tags: ['Rápida'],
        interval: 1,
        repetition: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        reviewCount: 0,
        failCount: 0,
        state: 'new',
      });
    } else if (activeType === 'task') {
      if (!taskTitle.trim()) return;
      onAddTask({
        id: `task-${Date.now()}`,
        title: taskTitle.trim(),
        date: new Date().toISOString().split('T')[0],
        durationMinutes: Number(taskDuration),
        priority: 'alta',
        status: 'pendiente',
        type: 'estudio',
      });
    } else if (activeType === 'askable') {
      if (!askTitle.trim() || !askDetails.trim()) return;
      onAddAskable({
        id: `ask-${Date.now()}`,
        topicId: fcTopic,
        category: askCategory,
        title: askTitle.trim(),
        details: askDetails.trim(),
        stars: 3,
        mastered: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Añadir Rápido a MiOpo
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type selector pills */}
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl my-4 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveType('note')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeType === 'note' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Nota
          </button>
          <button
            type="button"
            onClick={() => setActiveType('flashcard')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeType === 'flashcard' ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Flashcard
          </button>
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeType === 'task' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Tarea
          </button>
          <button
            type="button"
            onClick={() => setActiveType('askable')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeType === 'askable' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> Preguntable
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeType === 'note' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título de la Nota
                </label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ej: Esquema express de plazos de recursos"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Contenido
                </label>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Escribe tus notas aquí..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </>
          )}

          {activeType === 'flashcard' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Tema
                </label>
                <select
                  value={fcTopic}
                  onChange={(e) => setFcTopic(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {data.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.shortTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Pregunta (Anverso)
                </label>
                <input
                  type="text"
                  required
                  value={fcFront}
                  onChange={(e) => setFcFront(e.target.value)}
                  placeholder="¿Cuál es el plazo de prescripción de faltas muy graves?"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Respuesta (Reverso)
                </label>
                <input
                  type="text"
                  required
                  value={fcBack}
                  onChange={(e) => setFcBack(e.target.value)}
                  placeholder="3 años (art. 97 TREBEP)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </>
          )}

          {activeType === 'task' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Tarea para Hoy
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ej: Repasar tema 11 y hacer 30 psicotécnicos"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(parseInt(e.target.value) || 30)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </>
          )}

          {activeType === 'askable' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Categoría
                  </label>
                  <select
                    value={askCategory}
                    onChange={(e) => setAskCategory(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="plazo">Plazo</option>
                    <option value="mayoria">Mayoría</option>
                    <option value="organo">Órgano</option>
                    <option value="numero">Número</option>
                    <option value="articulo">Artículo</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tema
                  </label>
                  <select
                    value={fcTopic}
                    onChange={(e) => setFcTopic(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {data.topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Pregunta o Concepto
                </label>
                <input
                  type="text"
                  required
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  placeholder="Ej: Mayoría para aprobar una Ley Orgánica"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Dato Exacto
                </label>
                <input
                  type="text"
                  required
                  value={askDetails}
                  onChange={(e) => setAskDetails(e.target.value)}
                  placeholder="Mayoría absoluta del Congreso en una votación final sobre el conjunto del proyecto (art. 81.2 CE)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
