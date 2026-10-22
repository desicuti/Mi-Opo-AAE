import React, { useState } from 'react';
import {
  CheckSquare,
  AlertCircle,
  Plus,
  Play,
  Layers,
  TrendingUp,
  Filter,
  CheckCircle2,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FailedQuestion, MockExam, AppData, Flashcard } from '../types';

interface TestsSectionProps {
  data: AppData;
  activeTopicId?: string;
  onAddError: (err: FailedQuestion) => void;
  onDeleteError: (id: string) => void;
  onConvertErrorToFlashcard: (err: FailedQuestion) => void;
  onAddMockExam: (mock: MockExam) => void;
  onDeleteMockExam: (id: string) => void;
}

export const TestsSection: React.FC<TestsSectionProps> = ({
  data,
  activeTopicId,
  onAddError,
  onDeleteError,
  onConvertErrorToFlashcard,
  onAddMockExam,
  onDeleteMockExam,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'errores' | 'simulacros'>('errores');
  const [selectedTopic, setSelectedTopic] = useState<string>(activeTopicId || 'todos');
  const [selectedReason, setSelectedReason] = useState<string>('todos');
  const [showAddErrorModal, setShowAddErrorModal] = useState(false);
  const [showAddMockModal, setShowAddMockModal] = useState(false);

  // Interactive Review of Errors
  const [isReviewingErrors, setIsReviewingErrors] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [revealedExplanation, setRevealedExplanation] = useState(false);
  const [selectedReviewAnswer, setSelectedReviewAnswer] = useState<number | null>(null);

  // New Error Form State
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newMyIdx, setNewMyIdx] = useState(1);
  const [newTopicId, setNewTopicId] = useState(data.topics[0]?.id || 'b1-t1');
  const [newReason, setNewReason] = useState<FailedQuestion['reason']>('confusion');
  const [newExplanation, setNewExplanation] = useState('');
  const [newSource, setNewSource] = useState('Simulacro AAE');

  // New Mock Form State
  const [mockTitle, setMockTitle] = useState('Simulacro Oficial');
  const [mockDate, setMockDate] = useState(new Date().toISOString().split('T')[0]);
  const [mockType, setMockType] = useState<MockExam['type']>('temario-completo');
  const [mockTotal, setMockTotal] = useState(70);
  const [mockCorrect, setMockCorrect] = useState(50);
  const [mockIncorrect, setMockIncorrect] = useState(12);
  const [mockBlank, setMockBlank] = useState(8);
  const [mockTime, setMockTime] = useState(70);
  const [mockNotes, setMockNotes] = useState('');

  // Filter errors
  const filteredErrors = data.failedQuestions.filter((err) => {
    if (selectedTopic !== 'todos' && err.topicId !== selectedTopic) return false;
    if (selectedReason !== 'todos' && err.reason !== selectedReason) return false;
    return true;
  });

  const handleCreateError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newOptA.trim() || !newOptB.trim()) return;

    const options = [newOptA.trim(), newOptB.trim()];
    if (newOptC.trim()) options.push(newOptC.trim());
    if (newOptD.trim()) options.push(newOptD.trim());

    const created: FailedQuestion = {
      id: `err-${Date.now()}`,
      questionText: newQuestionText.trim(),
      options,
      correctAnswerIndex: newCorrectIdx,
      myAnswerIndex: newMyIdx,
      topicId: newTopicId,
      reason: newReason,
      explanation: newExplanation.trim() || 'Sin explicación anotada.',
      source: newSource.trim() || 'Simulacro',
      createdAt: new Date().toISOString(),
      reviewedCount: 0,
      isResolved: false,
    };

    onAddError(created);
    setShowAddErrorModal(false);
    setNewQuestionText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
    setNewExplanation('');
  };

  const handleCreateMock = (e: React.FormEvent) => {
    e.preventDefault();
    const penalty = data.settings.testPenaltyRatio || 0.33333;
    // Score out of 10: ((Correct - (Incorrect * penalty)) / Total) * 10
    const netPoints = Math.max(0, mockCorrect - mockIncorrect * penalty);
    const calculatedScore = Math.round((netPoints / mockTotal) * 10 * 100) / 100;

    const newMock: MockExam = {
      id: `mock-${Date.now()}`,
      title: mockTitle.trim(),
      date: mockDate,
      type: mockType,
      totalQuestions: Number(mockTotal),
      correct: Number(mockCorrect),
      incorrect: Number(mockIncorrect),
      blank: Number(mockBlank),
      score: calculatedScore,
      penaltyFactor: penalty,
      timeMinutes: Number(mockTime),
      notes: mockNotes.trim() || undefined,
    };

    onAddMockExam(newMock);
    setShowAddMockModal(false);
  };

  const getReasonLabel = (reason: FailedQuestion['reason']) => {
    switch (reason) {
      case 'no-sabia':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">No lo sabía</span>;
      case 'confusion':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Confusión</span>;
      case 'despiste':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Despiste</span>;
      case 'lei-mal':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Leí mal el enunciado</span>;
      case 'dudaba-dos':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">Dudaba entre dos</span>;
    }
  };

  // Sort mock exams chronologically for the SVG chart
  const sortedMocks = [...data.mockExams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-rose-600" /> Registro de Tests, Errores y Simulacros
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Analiza por qué fallas cada pregunta y sigue la evolución de tu nota en los simulacros.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeSubTab === 'errores' ? (
            <button
              onClick={() => setShowAddErrorModal(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar Pregunta Fallada
            </button>
          ) : (
            <button
              onClick={() => setShowAddMockModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Registrar Simulacro
            </button>
          )}
        </div>
      </div>

      {/* Subtab Toggle Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('errores')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'errores'
              ? 'border-rose-600 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Preguntas Falladas ({data.failedQuestions.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('simulacros')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
            activeSubTab === 'simulacros'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Simulacros y Gráfica ({data.mockExams.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: ERRORES DE TEST */}
      {activeSubTab === 'errores' && (
        <div className="space-y-6">
          {/* Quick Practice Mode Arena */}
          {isReviewingErrors && filteredErrors.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-rose-600 flex items-center gap-1.5">
                  <Play className="w-4 h-4 fill-rose-600" /> Repasando preguntas falladas
                </span>
                <span className="font-mono">
                  Pregunta {reviewIndex + 1} de {filteredErrors.length}
                </span>
                <button
                  onClick={() => setIsReviewingErrors(false)}
                  className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cerrar repaso
                </button>
              </div>

              {/* Question text */}
              <div className="space-y-4">
                <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
                  {filteredErrors[reviewIndex]?.questionText}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {filteredErrors[reviewIndex]?.options.map((opt, oIdx) => {
                    const isSelected = selectedReviewAnswer === oIdx;
                    const isCorrect = oIdx === filteredErrors[reviewIndex]?.correctAnswerIndex;
                    let style = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

                    if (revealedExplanation) {
                      if (isCorrect) style = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                      else if (isSelected) style = 'bg-rose-100 border-rose-500 text-rose-950';
                    }

                    return (
                      <div
                        key={oIdx}
                        onClick={() => {
                          if (!revealedExplanation) setSelectedReviewAnswer(oIdx);
                        }}
                        className={`p-3.5 rounded-2xl border text-xs md:text-sm cursor-pointer transition flex items-center justify-between ${style}`}
                      >
                        <span>
                          <strong className="mr-2">{String.fromCharCode(65 + oIdx)})</strong>
                          {opt}
                        </span>
                        {revealedExplanation && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Reveal & Next button */}
                <div className="pt-2 flex items-center justify-between">
                  {!revealedExplanation ? (
                    <button
                      onClick={() => setRevealedExplanation(true)}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                    >
                      Comprobar Explicación
                    </button>
                  ) : (
                    <div className="space-y-3 w-full">
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-slate-700 dark:text-slate-300">
                        <strong className="text-amber-800 dark:text-amber-300 block mb-1">
                          Explicación y fundamentación:
                        </strong>
                        <p>{filteredErrors[reviewIndex]?.explanation}</p>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => {
                            if (filteredErrors[reviewIndex]) {
                              onConvertErrorToFlashcard(filteredErrors[reviewIndex]);
                              alert('¡Convertido en Flashcard para repaso espaciado!');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl border border-purple-200 text-purple-700 dark:text-purple-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-purple-50"
                        >
                          <Layers className="w-3.5 h-3.5" /> Convertir en Flashcard
                        </button>

                        <button
                          onClick={() => {
                            setRevealedExplanation(false);
                            setSelectedReviewAnswer(null);
                            if (reviewIndex + 1 < filteredErrors.length) {
                              setReviewIndex(reviewIndex + 1);
                            } else {
                              alert('¡Has completado el repaso de errores!');
                              setIsReviewingErrors(false);
                            }
                          }}
                          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                        >
                          Siguiente Pregunta →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Errors Filter Bar & Launch Button */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
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
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <option value="todos">Todos los motivos de fallo</option>
                    <option value="no-sabia">No lo sabía</option>
                    <option value="confusion">Confusión</option>
                    <option value="despiste">Despiste</option>
                    <option value="lei-mal">Leí mal</option>
                    <option value="dudaba-dos">Dudaba entre dos</option>
                  </select>
                </div>

                {filteredErrors.length > 0 && (
                  <button
                    onClick={() => {
                      setReviewIndex(0);
                      setRevealedExplanation(false);
                      setSelectedReviewAnswer(null);
                      setIsReviewingErrors(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Repasar estos errores ({filteredErrors.length})
                  </button>
                )}
              </div>

              {/* Errors List */}
              <div className="space-y-3">
                {filteredErrors.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 stroke-1" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      No hay errores registrados con estos filtros.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Registra cada fallo de tus simulacros para no volver a tropezar con la misma piedra.
                    </p>
                  </div>
                ) : (
                  filteredErrors.map((err) => {
                    const topicObj = data.topics.find((t) => t.id === err.topicId);
                    return (
                      <div
                        key={err.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getReasonLabel(err.reason)}
                            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                              {topicObj?.shortTitle || 'Tema'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">• {err.source}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                onConvertErrorToFlashcard(err);
                                alert('¡Convertido en Flashcard!');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-[11px] font-semibold flex items-center gap-1 transition"
                              title="Crear flashcard a partir de esta pregunta"
                            >
                              <Layers className="w-3 h-3" /> Crear Flashcard
                            </button>
                            <button
                              onClick={() => onDeleteError(err.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                              title="Eliminar pregunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {err.questionText}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
                            <strong>Mi respuesta fallada:</strong> {err.options[err.myAnswerIndex]}
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
                            <strong>Respuesta correcta:</strong> {err.options[err.correctAnswerIndex]}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Explicación:</strong> {err.explanation}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: SIMULACROS Y GRÁFICA */}
      {activeSubTab === 'simulacros' && (
        <div className="space-y-6">
          {/* Interactive Evolution Chart (SVG) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Evolución de Notas en Simulacros
                </h3>
                <p className="text-xs text-slate-500">
                  Calculado sobre 10 puntos con penalización de -1/3 por cada respuesta incorrecta.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                Aprobado: ≥ 5.0
              </span>
            </div>

            {sortedMocks.length > 0 ? (
              <div className="h-56 w-full pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                  {/* Grid lines 0, 5, 10 */}
                  <line x1="30" y1="20" x2="480" y2="20" stroke="#94a3b8" strokeDasharray="3" strokeWidth="0.5" />
                  <text x="5" y="24" fontSize="9" fill="#94a3b8">10</text>

                  <line x1="30" y1="75" x2="480" y2="75" stroke="#f59e0b" strokeDasharray="4" strokeWidth="1" />
                  <text x="5" y="79" fontSize="9" fill="#f59e0b" fontWeight="bold">5.0</text>

                  <line x1="30" y1="130" x2="480" y2="130" stroke="#94a3b8" strokeDasharray="3" strokeWidth="0.5" />
                  <text x="12" y="134" fontSize="9" fill="#94a3b8">0</text>

                  {/* Polyline of scores */}
                  {sortedMocks.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sortedMocks
                        .map((m, idx) => {
                          const x = 40 + (idx / (sortedMocks.length - 1)) * 430;
                          const y = 130 - (m.score / 10) * 110;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />
                  )}

                  {/* Circles and score tooltips */}
                  {sortedMocks.map((m, idx) => {
                    const x = sortedMocks.length === 1 ? 250 : 40 + (idx / (sortedMocks.length - 1)) * 430;
                    const y = 130 - (m.score / 10) * 110;
                    return (
                      <g key={m.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          className={m.score >= 5 ? 'fill-emerald-500' : 'fill-rose-500'}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y - 10}
                          fontSize="10"
                          fontWeight="bold"
                          fill="currentColor"
                          textAnchor="middle"
                          className="dark:fill-white fill-slate-800"
                        >
                          {m.score}
                        </text>
                        <text
                          x={x}
                          y={145}
                          fontSize="8"
                          fill="#94a3b8"
                          textAnchor="middle"
                        >
                          {m.date.slice(5)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">
                Aún no has registrado ningún simulacro.
              </p>
            )}
          </div>

          {/* List of Mock Exams */}
          <div className="space-y-3">
            {sortedMocks.map((mock) => (
              <div
                key={mock.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {mock.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {mock.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="text-emerald-600 font-semibold">✓ {mock.correct} aciertos</span>
                    <span className="text-rose-600 font-semibold">✗ {mock.incorrect} fallos</span>
                    <span>⚪ {mock.blank} blanco</span>
                    <span>⏱ {mock.timeMinutes} min</span>
                  </div>
                  {mock.notes && <p className="text-xs text-slate-400 italic">{mock.notes}</p>}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nota Final</span>
                    <span
                      className={`text-2xl font-black font-mono ${
                        mock.score >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {mock.score} / 10
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteMockExam(mock.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition"
                    title="Eliminar registro de simulacro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Registrar Pregunta Fallada */}
      {showAddErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Registrar Pregunta Fallada en Test
            </h3>
            <form onSubmit={handleCreateError} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Enunciado de la Pregunta
                </label>
                <textarea
                  rows={2}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Ej: ¿Cuál es el plazo general para notificar la resolución expresa en la Ley 39/2015?"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                  Opciones (mínimo A y B)
                </label>
                <input
                  type="text"
                  required
                  value={newOptA}
                  onChange={(e) => setNewOptA(e.target.value)}
                  placeholder="A) 3 meses"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="text"
                  required
                  value={newOptB}
                  onChange={(e) => setNewOptB(e.target.value)}
                  placeholder="B) 6 meses"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={newOptC}
                  onChange={(e) => setNewOptC(e.target.value)}
                  placeholder="C) 1 mes (opcional)"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={newOptD}
                  onChange={(e) => setNewOptD(e.target.value)}
                  placeholder="D) 10 días (opcional)"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-emerald-600 block mb-1">
                    Respuesta Correcta
                  </label>
                  <select
                    value={newCorrectIdx}
                    onChange={(e) => setNewCorrectIdx(parseInt(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value={0}>Opción A</option>
                    <option value={1}>Opción B</option>
                    <option value={2}>Opción C</option>
                    <option value={3}>Opción D</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-rose-600 block mb-1">
                    Mi Respuesta (Fallada)
                  </label>
                  <select
                    value={newMyIdx}
                    onChange={(e) => setNewMyIdx(parseInt(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value={0}>Opción A</option>
                    <option value={1}>Opción B</option>
                    <option value={2}>Opción C</option>
                    <option value={3}>Opción D</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tema
                  </label>
                  <select
                    value={newTopicId}
                    onChange={(e) => setNewTopicId(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
                    Motivo del Error
                  </label>
                  <select
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  >
                    <option value="no-sabia">No lo sabía</option>
                    <option value="confusion">Confusión</option>
                    <option value="despiste">Despiste</option>
                    <option value="lei-mal">Leí mal el enunciado</option>
                    <option value="dudaba-dos">Dudaba entre dos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Explicación y Fundamentación Jurídica
                </label>
                <textarea
                  rows={2}
                  required
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Art. 21.3 Ley 39/2015: Cuando las normas reguladoras no fijen plazo, este será de 3 meses."
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Fuente del Examen
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="Ej: Examen Oficial AAE 2023, Test OpositaTest..."
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddErrorModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  Guardar Error
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Simulacro */}
      {showAddMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Registrar Nuevo Simulacro
            </h3>
            <form onSubmit={handleCreateMock} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título del Simulacro
                </label>
                <input
                  type="text"
                  required
                  value={mockTitle}
                  onChange={(e) => setMockTitle(e.target.value)}
                  placeholder="Ej: Simulacro Oficial Convocatoria 2024"
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={mockDate}
                    onChange={(e) => setMockDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tiempo (min)
                  </label>
                  <input
                    type="number"
                    required
                    value={mockTime}
                    onChange={(e) => setMockTime(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Total Preg.
                  </label>
                  <input
                    type="number"
                    required
                    value={mockTotal}
                    onChange={(e) => setMockTotal(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-emerald-600 block mb-1">
                    Aciertos
                  </label>
                  <input
                    type="number"
                    required
                    value={mockCorrect}
                    onChange={(e) => setMockCorrect(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-600 block mb-1">
                    Fallos
                  </label>
                  <input
                    type="number"
                    required
                    value={mockIncorrect}
                    onChange={(e) => setMockIncorrect(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/40 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  En blanco
                </label>
                <input
                  type="number"
                  value={mockBlank}
                  onChange={(e) => setMockBlank(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Observaciones / Sensaciones
                </label>
                <input
                  type="text"
                  value={mockNotes}
                  onChange={(e) => setMockNotes(e.target.value)}
                  placeholder="Ej: Faltó tiempo en psicotécnicos..."
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMockModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Calcular y Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
