import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileText,
  FolderArchive,
  Lightbulb,
  Layers,
  AlertCircle,
  Headphones,
  Star,
  Calendar,
  CheckCircle,
  Plus,
  Play,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Topic,
  AppData,
  Note,
  Flashcard,
  FailedQuestion,
  AskableItem,
  MemoryTechnique,
  AudioTrack,
} from '../types';

interface TopicDetailModalProps {
  topic: Topic;
  data: AppData;
  onClose: () => void;
  onUpdateTopic: (updatedTopic: Topic) => void;
  onOpenNote: (note: Note) => void;
  onNewNoteForTopic: (topicId: string) => void;
  onPracticeFlashcards: (topicId: string) => void;
  onPracticeErrors: (topicId: string) => void;
  onToggleAskableMastered: (askableId: string) => void;
  onScheduleSpacedRepetition: (topicId: string) => void;
}

export type TopicTab =
  | 'resumen'
  | 'apuntes'
  | 'archivos'
  | 'analogias'
  | 'flashcards'
  | 'errores'
  | 'audios'
  | 'preguntable'
  | 'repasos';

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  data,
  onClose,
  onUpdateTopic,
  onOpenNote,
  onNewNoteForTopic,
  onPracticeFlashcards,
  onPracticeErrors,
  onToggleAskableMastered,
  onScheduleSpacedRepetition,
}) => {
  const [activeTab, setActiveTab] = useState<TopicTab>('resumen');

  // Filter linked items
  const topicNotes = data.notes.filter((n) => n.topicId === topic.id);
  const topicFiles = data.files.filter((f) => f.topicId === topic.id);
  const topicLinks = data.links.filter((l) => l.topicId === topic.id);
  const topicMnemonics = data.memoryTechniques.filter((m) => m.topicId === topic.id);
  const topicFlashcards = data.flashcards.filter((f) => f.topicId === topic.id);
  const topicErrors = data.failedQuestions.filter((e) => e.topicId === topic.id);
  const topicAudios = data.audioTracks.filter((a) => a.topicId === topic.id);
  const topicAskables = data.askableItems.filter((a) => a.topicId === topic.id);

  const tabs = [
    { id: 'resumen' as TopicTab, label: 'Resumen', icon: BookOpen },
    { id: 'apuntes' as TopicTab, label: 'Apuntes', count: topicNotes.length, icon: FileText },
    { id: 'archivos' as TopicTab, label: 'Archivos y enlaces', count: topicFiles.length + topicLinks.length, icon: FolderArchive },
    { id: 'analogias' as TopicTab, label: 'Analogías y técnicas', count: topicMnemonics.length, icon: Lightbulb },
    { id: 'flashcards' as TopicTab, label: 'Flashcards', count: topicFlashcards.length, icon: Layers },
    { id: 'errores' as TopicTab, label: 'Errores', count: topicErrors.length, icon: AlertCircle },
    { id: 'audios' as TopicTab, label: 'Audios y canciones', count: topicAudios.length, icon: Headphones },
    { id: 'preguntable' as TopicTab, label: 'Lo más preguntable', count: topicAskables.length, icon: Star },
    { id: 'repasos' as TopicTab, label: 'Repasos', icon: Calendar },
  ];

  const handleStatusChange = (newStatus: Topic['status']) => {
    let newProgress = topic.progress;
    if (newStatus === 'dominado') newProgress = 100;
    else if (newStatus === 'sin-empezar') newProgress = 0;
    else if (newStatus === 'estudiado' && newProgress < 80) newProgress = 80;

    const updated = {
      ...topic,
      status: newStatus,
      progress: newProgress,
      lastReviewed: new Date().toISOString(),
    };
    onUpdateTopic(updated);

    // If marked studied or mastered, propose scheduling spaced repetition
    if (newStatus === 'estudiado' || newStatus === 'repasado') {
      onScheduleSpacedRepetition(topic.id);
    }
  };

  const handleProgressChange = (val: number) => {
    let newStatus = topic.status;
    if (val === 100) newStatus = 'dominado';
    else if (val >= 80 && newStatus === 'estudiando') newStatus = 'estudiado';
    else if (val > 0 && newStatus === 'sin-empezar') newStatus = 'estudiando';

    onUpdateTopic({
      ...topic,
      progress: val,
      status: newStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {topic.blockId === 'bloque-1' ? 'Bloque 1: Org. Pública' : topic.blockId === 'bloque-2' ? 'Bloque 2: Ofimática' : 'Bloque 3: Psicotécnicos'}
              </span>
              <span className="text-xs font-semibold text-slate-500">Tema {topic.number}</span>
            </div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {topic.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-200 dark:border-slate-800 px-4 flex items-center gap-1 overflow-x-auto bg-white dark:bg-slate-900 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 border-b-2 transition ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded-full font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Descripción Oficial del Programa
                </h4>
                <p>{topic.description}</p>
              </div>

              {/* Status and Progress Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Estado Actual
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['sin-empezar', 'estudiando', 'estudiado', 'repasado', 'dominado'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(st)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition border ${
                            topic.status === st
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {st.replace('-', ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Porcentaje de Progreso
                    </label>
                    <span className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {topic.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={topic.progress}
                    onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>0% Inicio</span>
                    <span>50% Asimilado</span>
                    <span>100% Dominado</span>
                  </div>
                </div>
              </div>

              {/* Quick stats for this topic */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <Clock className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
                    {Math.round((topic.studyMinutesTotal || 0) / 60)}h {(topic.studyMinutesTotal || 0) % 60}m
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Tiempo dedicado</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <Layers className="w-4 h-4 mx-auto text-purple-600 mb-1" />
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
                    {topicFlashcards.length}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Flashcards</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <AlertCircle className="w-4 h-4 mx-auto text-rose-500 mb-1" />
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono block">
                    {topicErrors.length}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Errores registrados</span>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Etiquetas Clave</span>
                <div className="flex flex-wrap gap-1.5">
                  {topic.tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APUNTES */}
          {activeTab === 'apuntes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Apuntes y Esquemas vinculados ({topicNotes.length})
                </h4>
                <button
                  onClick={() => onNewNoteForTopic(topic.id)}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Nueva Nota
                </button>
              </div>

              {topicNotes.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p>Aún no has creado apuntes para este tema.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topicNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => onOpenNote(note)}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-white dark:bg-slate-900 cursor-pointer transition shadow-xs"
                    >
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">{note.title}</h5>
                      <div
                        className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1"
                        dangerouslySetInnerHTML={{ __html: note.contentHtml }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ARCHIVOS Y ENLACES */}
          {activeTab === 'archivos' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Materiales y Documentos ({topicFiles.length + topicLinks.length})
              </h4>
              {topicFiles.length === 0 && topicLinks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No hay archivos ni enlaces vinculados a este tema. Puedes subirlos desde la sección «Archivos y enlaces».
                </p>
              ) : (
                <div className="space-y-2">
                  {topicFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        📄 {file.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                  {topicLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block">
                          🔗 {link.title}
                        </span>
                        <span className="text-[11px] text-slate-500">{link.description}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ANALOGÍAS Y TÉCNICAS */}
          {activeTab === 'analogias' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Técnicas de Memorización para este Tema ({topicMnemonics.length})
              </h4>
              {topicMnemonics.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  Aún no hay técnicas creadas para este tema.
                </p>
              ) : (
                <div className="space-y-3">
                  {topicMnemonics.map((mnem) => (
                    <div
                      key={mnem.id}
                      className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                          💡 {mnem.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          {mnem.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">{mnem.explanation}</p>
                      <div className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                        {mnem.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Mazo de Flashcards ({topicFlashcards.length})
                </h4>
                {topicFlashcards.length > 0 && (
                  <button
                    onClick={() => onPracticeFlashcards(topic.id)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Repasar este Mazo
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {topicFlashcards.map((fc) => (
                  <div
                    key={fc.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Q: {fc.front}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A: {fc.back}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: ERRORES */}
          {activeTab === 'errores' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Preguntas falladas en este tema ({topicErrors.length})
                </h4>
                {topicErrors.length > 0 && (
                  <button
                    onClick={() => onPracticeErrors(topic.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Repasar estos errores
                  </button>
                )}
              </div>

              {topicErrors.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  ¡Genial! No tienes preguntas falladas registradas en este tema.
                </p>
              ) : (
                <div className="space-y-3">
                  {topicErrors.map((err) => (
                    <div
                      key={err.id}
                      className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 space-y-2"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{err.questionText}</p>
                      <div className="text-xs space-y-1">
                        <p className="text-rose-600 dark:text-rose-400">
                          ❌ Mi respuesta: {err.options[err.myAnswerIndex]}
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          ✓ Correcta: {err.options[err.correctAnswerIndex]}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg">
                        <strong>Explicación:</strong> {err.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: AUDIOS Y CANCIONES */}
          {activeTab === 'audios' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Audios y Letras mnemotécnicas ({topicAudios.length})
              </h4>
              {topicAudios.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No hay pistas de audio vinculadas a este tema todavía.
                </p>
              ) : (
                <div className="space-y-2">
                  {topicAudios.map((aud) => (
                    <div
                      key={aud.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          🎧 {aud.title}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{aud.duration}s</span>
                      </div>
                      {aud.lyrics && (
                        <div className="text-xs font-mono bg-slate-50 dark:bg-slate-800 p-3 rounded-xl whitespace-pre-line text-slate-600 dark:text-slate-300">
                          {aud.lyrics}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: LO MÁS PREGUNTABLE */}
          {activeTab === 'preguntable' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Datos TOP de Examen de este Tema ({topicAskables.length})
              </h4>
              <div className="space-y-2">
                {topicAskables.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      item.mastered
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-amber-200/80 dark:border-amber-900/60 shadow-xs'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          {item.category}
                        </span>
                        <span className="text-amber-500 font-bold text-xs">
                          {'★'.repeat(item.stars)}
                        </span>
                        {item.lawReference && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.lawReference}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{item.details}</p>
                    </div>
                    <button
                      onClick={() => onToggleAskableMastered(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition flex-shrink-0 ${
                        item.mastered
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{item.mastered ? '¡Dominado!' : 'Marcar visto'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: REPASOS */}
          {activeTab === 'repasos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Calendario de Repaso Espaciado (+1, +7, +21, +45 días)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Al completar este tema, el sistema genera automáticamente 4 tareas de repaso en tu planificador para consolidar la memoria a largo plazo según la curva del olvido de Ebbinghaus.
                </p>
                <button
                  onClick={() => onScheduleSpacedRepetition(topic.id)}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Generar 4 repasos espaciados ahora
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h5 className="font-bold text-xs text-slate-500 uppercase">Fechas de Seguimiento</h5>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Última revisión:</strong>{' '}
                  {topic.lastReviewed
                    ? new Date(topic.lastReviewed).toLocaleDateString()
                    : 'Aún no revisado'}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <strong>Próximo repaso programado:</strong>{' '}
                  {topic.nextReviewDate ? topic.nextReviewDate : 'Sin fecha asignada'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
