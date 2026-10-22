import React, { useState, useEffect } from 'react';
import {
  Layers,
  Play,
  RotateCcw,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Brain,
  Filter,
} from 'lucide-react';
import { Flashcard, AppData } from '../types';
import { calculateSM2, getDueFlashcards, ReviewGrade } from '../services/sm2';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface FlashcardsSectionProps {
  data: AppData;
  activeTopicId?: string;
  onUpdateFlashcard: (updatedCard: Flashcard) => void;
  onAddFlashcard: (card: Flashcard) => void;
  onBatchImportFlashcards: (cards: Flashcard[]) => void;
}

export const FlashcardsSection: React.FC<FlashcardsSectionProps> = ({
  data,
  activeTopicId,
  onUpdateFlashcard,
  onAddFlashcard,
  onBatchImportFlashcards,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(activeTopicId || 'todos');
  const [onlyHardMode, setOnlyHardMode] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0);

  // Modal for new flashcard
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopicId, setNewTopicId] = useState(data.topics[0]?.id || '');
  const [newImage, setNewImage] = useState('');

  // Start a study session
  const startSession = (topicFilter?: string, onlyHard?: boolean) => {
    const due = getDueFlashcards(
      data.flashcards,
      topicFilter !== 'todos' ? topicFilter : undefined,
      onlyHard
    );
    if (due.length === 0) {
      alert('¡Enhorabuena! No tienes tarjetas pendientes para repasar con este filtro.');
      return;
    }
    setStudyQueue(due);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompletedCount(0);
    setIsStudying(true);
  };

  // Current active card in session
  const currentCard = studyQueue[currentIndex];

  // Grade rating handler
  const handleRate = (grade: ReviewGrade) => {
    if (!currentCard) return;

    const updated = calculateSM2(currentCard, grade);
    onUpdateFlashcard(updated);

    if (grade === 'easy' || grade === 'good') {
      sound.playSuccess();
    }

    setIsFlipped(false);

    if (currentIndex + 1 < studyQueue.length) {
      setCurrentIndex(currentIndex + 1);
      setSessionCompletedCount((prev) => prev + 1);
    } else {
      // Completed session
      confetti({ particleCount: 80, spread: 80 });
      setSessionCompletedCount((prev) => prev + 1);
      setIsStudying(false);
    }
  };

  // Keyboard navigation for flashcards
  useEffect(() => {
    if (!isStudying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        if (e.key === '2') handleRate('hard');
        if (e.key === '3') handleRate('good');
        if (e.key === '4') handleRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudying, isFlipped, currentCard]);

  // Create flashcard
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-${Date.now()}`,
      topicId: newTopicId,
      front: newFront.trim(),
      back: newBack.trim(),
      imageUrl: newImage.trim() || undefined,
      tags: ['Manual'],
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: new Date().toISOString(),
      reviewCount: 0,
      failCount: 0,
      state: 'new',
    };

    onAddFlashcard(newCard);
    setNewFront('');
    setNewBack('');
    setNewImage('');
    setShowAddModal(false);
  };

  // Export Flashcards as CSV
  const handleExportCSV = () => {
    const header = 'Front,Back,TopicId,Interval,EaseFactor\n';
    const rows = data.flashcards.map(
      (f) =>
        `"${f.front.replace(/"/g, '""')}","${f.back.replace(/"/g, '""')}","${f.topicId}",${f.interval},${f.easeFactor}`
    );
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Flashcards_MiOpo_AAE_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Flashcards from CSV / Anki text
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const imported: Flashcard[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || (i === 0 && line.toLowerCase().startsWith('front'))) continue;

        // Simple delimiter check (tab or comma)
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        if (parts.length >= 2) {
          const front = parts[0].replace(/^"|"$/g, '').trim();
          const back = parts[1].replace(/^"|"$/g, '').trim();
          if (front && back) {
            imported.push({
              id: `fc-imp-${Date.now()}-${i}`,
              topicId: selectedTopicId !== 'todos' ? selectedTopicId : data.topics[0]?.id || 'b1-t1',
              front,
              back,
              tags: ['Importado'],
              interval: 1,
              repetition: 0,
              easeFactor: 2.5,
              nextReview: new Date().toISOString(),
              reviewCount: 0,
              failCount: 0,
              state: 'new',
            });
          }
        }
      }

      if (imported.length > 0) {
        onBatchImportFlashcards(imported);
        alert(`¡Se importaron ${imported.length} flashcards con éxito!`);
      }
    };
    reader.readAsText(file);
  };

  // Overall flashcard statistics
  const totalCards = data.flashcards.length;
  const dueCardsToday = getDueFlashcards(data.flashcards);
  const masteredCards = data.flashcards.filter((f) => f.interval >= 21).length;
  const hardCards = data.flashcards.filter((f) => (f.failCount || 0) > 0).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-600" /> Flashcards con Algoritmo SM-2
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Repetición espaciada científica para fijar los artículos, plazos y atajos en tu memoria a largo plazo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Exportar a CSV / Anki"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <label className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar</span>
            <input type="file" accept=".csv,.txt" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Crear Tarjeta
          </button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Tarjetas</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalCards}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-500 block mb-1">Para Repasar Hoy</span>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {dueCardsToday.length}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">Consolidadas (&gt;21d)</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {masteredCards}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">Difíciles / Falladas</span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {hardCards}
          </span>
        </div>
      </div>

      {/* Flashcard Study Arena (if studying) */}
      {isStudying && currentCard ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 md:p-10 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
          {/* Header of session */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Sesión en marcha
            </span>
            <span className="font-mono font-bold">
              Tarjeta {currentIndex + 1} de {studyQueue.length}
            </span>
            <button
              onClick={() => setIsStudying(false)}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Salir de la sesión
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / studyQueue.length) * 100}%` }}
            />
          </div>

          {/* Flashcard Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[280px] md:min-h-[320px] rounded-3xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-sm hover:shadow-md transition select-none"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100/60 dark:bg-purple-950/60 px-3 py-1 rounded-full">
              {isFlipped ? 'Respuesta (Reverso)' : 'Pregunta (Anverso) — Clic o barra espaciadora para voltear'}
            </span>

            <div className="my-auto max-w-xl space-y-4">
              <p className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              {currentCard.imageUrl && isFlipped && (
                <img
                  src={currentCard.imageUrl}
                  alt="Esquema"
                  className="max-h-48 rounded-xl mx-auto object-contain border"
                />
              )}
            </div>

            <span className="text-xs text-slate-400">
              {isFlipped ? 'Evalúa tu nivel de recuerdo abajo:' : 'Haz clic para ver la respuesta'}
            </span>
          </div>

          {/* SM-2 Rating Buttons (only visible when flipped) */}
          {isFlipped ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => handleRate('again')}
                className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs flex flex-col items-center gap-0.5 transition"
              >
                <span>1. Otra vez</span>
                <span className="text-[10px] opacity-75 font-normal">Reinicia a 1 día</span>
              </button>
              <button
                onClick={() => handleRate('hard')}
                className="py-3 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-bold text-xs flex flex-col items-center gap-0.5 transition"
              >
                <span>2. Difícil</span>
                <span className="text-[10px] opacity-75 font-normal">Intervalo corto</span>
              </button>
              <button
                onClick={() => handleRate('good')}
                className="py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold text-xs flex flex-col items-center gap-0.5 transition"
              >
                <span>3. Bien</span>
                <span className="text-[10px] opacity-75 font-normal">Progreso normal</span>
              </button>
              <button
                onClick={() => handleRate('easy')}
                className="py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-bold text-xs flex flex-col items-center gap-0.5 transition"
              >
                <span>4. Fácil</span>
                <span className="text-[10px] opacity-75 font-normal">Intervalo largo</span>
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setIsFlipped(true)}
                className="px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition"
              >
                Mostrar Respuesta (Espacio)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Deck Selector and Start Arena */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Repaso Diario Inteligente</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black">
                Tienes {dueCardsToday.length} tarjetas pendientes para hoy
              </h3>
              <p className="text-xs text-purple-200">
                El algoritmo calcula el intervalo exacto para que repases justo antes de que tu memoria olvide el dato.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => startSession(selectedTopicId, false)}
                className="px-6 py-3.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Iniciar Repaso del Día ({dueCardsToday.length})</span>
              </button>
              <button
                onClick={() => startSession(selectedTopicId, true)}
                className="px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                Repasar solo difíciles ({hardCards})
              </button>
            </div>
          </div>

          {/* Filter by Topic and Flashcard Browser */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" /> Filtrar Mazo por Tema
              </h4>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-full sm:w-80"
              >
                <option value="todos">Todos los temas ({data.flashcards.length} tarjetas)</option>
                {data.topics.map((t) => {
                  const count = data.flashcards.filter((f) => f.topicId === t.id).length;
                  return (
                    <option key={t.id} value={t.id}>
                      {t.shortTitle} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* List of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {data.flashcards
                .filter((f) => selectedTopicId === 'todos' || f.topicId === selectedTopicId)
                .map((card) => (
                  <div
                    key={card.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 hover:border-purple-300 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        Intervalo: {card.interval} días
                      </span>
                      <span>Factor: {card.easeFactor}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{card.front}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-1.5">
                      {card.back}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Tarjeta */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Nueva Flashcard para Repaso Espaciado
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

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Anverso (Pregunta, concepto o artículo)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Ej: ¿Cuáles son las mayorías necesarias para la reforma constitucional del art. 167?"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Reverso (Respuesta concisa y datos exactos)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Ej: Mayoría de 3/5 de cada Cámara. Si no hay acuerdo, Comisión paritaria..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  URL de Imagen / Esquema (opcional)
                </label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  Guardar Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
