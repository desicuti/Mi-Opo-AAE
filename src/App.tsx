import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavSection } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SyllabusSection } from './components/SyllabusSection';
import { NotesSection } from './components/NotesSection';
import { FlashcardsSection } from './components/FlashcardsSection';
import { TestsSection } from './components/TestsSection';
import { MostAskableSection } from './components/MostAskableSection';
import { MnemonicsSection } from './components/MnemonicsSection';
import { AudioSection } from './components/AudioSection';
import { PlannerSection } from './components/PlannerSection';
import { StatsSection } from './components/StatsSection';
import { LawsSection } from './components/LawsSection';
import { SettingsSection } from './components/SettingsSection';
import { FilesAndLinksSection } from './components/FilesAndLinksSection';
import { TopicDetailModal } from './components/TopicDetailModal';
import { QuickAddModal } from './components/QuickAddModal';
import { DriveGuideModal } from './components/DriveGuideModal';
import { OnboardingModal } from './components/OnboardingModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PomodoroWidget } from './components/PomodoroWidget';
import { dbService } from './services/db';
import { googleDriveService } from './services/googleDrive';
import {
  AppData,
  Topic,
  Task,
  Flashcard,
  FailedQuestion,
  MockExam,
  AskableItem,
  Note,
  MemoryTechnique,
  AudioTrack,
  FileItem,
  WebLink,
  LawResource,
  AppSettings,
} from './types';
import { INITIAL_DATA } from './data/initialData';

export default function App() {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);

  // Modals
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>(undefined);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Load persisted state from IndexedDB on startup
  useEffect(() => {
    async function init() {
      try {
        const stored = await dbService.loadData();
        if (stored) {
          setData(stored);
        }
        // Check if user has seen onboarding
        const hasSeenTour = localStorage.getItem('miopo_has_seen_tour');
        if (!hasSeenTour) {
          setShowOnboarding(true);
          localStorage.setItem('miopo_has_seen_tour', 'true');
        }
      } catch (e) {
        console.error('Failed to load initial data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Update theme & font size on HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (data.settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (data.settings.fontSize === 'small') {
      root.style.fontSize = '14px';
    } else if (data.settings.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [data.settings.darkMode, data.settings.fontSize]);

  // Central State Mutator with IndexedDB Save & Google Drive Debounced Sync
  const updateAppData = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => {
      const updated = updater(prev);
      updated.lastUpdated = new Date().toISOString();

      // Persist to local IndexedDB
      dbService.saveData(updated).catch(console.error);

      // Trigger debounced Drive sync
      googleDriveService.debounceSync(updated, (status, ts) => {
        setData((curr) => ({
          ...curr,
          settings: {
            ...curr.settings,
            driveSyncStatus: status,
            lastSyncTimestamp: ts || curr.settings.lastSyncTimestamp,
          },
        }));
      });

      return updated;
    });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInput) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowQuickAdd(true);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPomodoroActive((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Manual Sync Now Trigger
  const handleSyncNow = async () => {
    try {
      const synced = await googleDriveService.sync(data, (status, ts) => {
        setData((curr) => ({
          ...curr,
          settings: {
            ...curr.settings,
            driveSyncStatus: status,
            lastSyncTimestamp: ts || curr.settings.lastSyncTimestamp,
          },
        }));
      });
      setData(synced);
    } catch (err: any) {
      alert(`Error al sincronizar con Google Drive: ${err?.message || 'Error desconocido'}`);
    }
  };

  // Connect to Google Drive via GIS
  const handleConnectDrive = async () => {
    try {
      await googleDriveService.authenticate(data.settings.googleClientId);
      setData((curr) => ({
        ...curr,
        settings: {
          ...curr.settings,
          driveSyncStatus: 'pendiente',
        },
      }));
      await handleSyncNow();
    } catch (err: any) {
      alert(`No se pudo conectar a Google Drive: ${err?.message || err}. Revisa tu ID de cliente.`);
    }
  };

  const handleDisconnectDrive = () => {
    googleDriveService.disconnect();
    setData((curr) => ({
      ...curr,
      settings: {
        ...curr.settings,
        driveSyncStatus: 'desconectado',
      },
    }));
  };

  // Toggle Dark Mode
  const toggleTheme = () => {
    updateAppData((prev) => ({
      ...prev,
      settings: { ...prev.settings, darkMode: !prev.settings.darkMode },
    }));
  };

  // Study log recorder
  const handleLogStudySession = (minutes: number, topicId?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    updateAppData((prev) => {
      const updatedTopics = prev.topics.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            studyMinutesTotal: (t.studyMinutesTotal || 0) + minutes,
            lastReviewed: new Date().toISOString(),
          };
        }
        return t;
      });

      return {
        ...prev,
        topics: updatedTopics,
        studyLogs: [
          ...prev.studyLogs,
          {
            id: `log-${Date.now()}`,
            date: todayStr,
            minutes,
            type: 'pomodoro',
            topicId,
          },
        ],
      };
    });
  };

  // Automatic Spaced Repetition Scheduler (+1, +7, +21, +45 days)
  const handleScheduleSpacedRepetition = (topicId: string) => {
    const topic = data.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const intervals = [1, 7, 21, 45];
    const newTasks: Task[] = intervals.map((days, idx) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      const dateStr = d.toISOString().split('T')[0];
      return {
        id: `sr-task-${topic.id}-${days}-${Date.now()}`,
        title: `Repaso ${idx + 1} (+${days}d): ${topic.shortTitle}`,
        topicId: topic.id,
        blockId: topic.blockId,
        durationMinutes: 45,
        priority: days === 1 ? 'alta' : 'media',
        status: 'pendiente',
        date: dateStr,
        type: 'repaso',
      };
    });

    updateAppData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, ...newTasks],
    }));
  };

  // Compute counts for badges
  const todayEnd = new Date().setHours(23, 59, 59, 999);
  const dueFlashcardsCount = data.flashcards.filter((f) => {
    if (!f.nextReview) return true;
    return new Date(f.nextReview).getTime() <= todayEnd;
  }).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasksCount = data.tasks.filter(
    (t) => t.date === todayStr && t.status === 'pendiente'
  ).length;

  // Selected topic object for modal
  const activeTopicObj = data.topics.find((t) => t.id === selectedTopicId) || null;

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center mb-4">
          <span className="font-black text-xl">AAE</span>
        </div>
        <p className="font-bold text-sm tracking-wide">Cargando MiOpo AAE...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        settings={data.settings}
        onOpenQuickAdd={() => setShowQuickAdd(true)}
        dueFlashcardsCount={dueFlashcardsCount}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          settings={data.settings}
          onToggleTheme={toggleTheme}
          onSyncNow={handleSyncNow}
          onOpenDriveSettings={() => setCurrentSection('settings')}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onTogglePomodoro={() => setIsPomodoroActive(!isPomodoroActive)}
          onOpenGuide={() => setShowDriveGuide(true)}
          isPomodoroActive={isPomodoroActive}
        />

        {/* Global Floating Pomodoro Mini-Bar (if active) */}
        {isPomodoroActive && (
          <div className="bg-indigo-900/90 text-white border-b border-indigo-700/60 px-6 py-2 flex items-center justify-between text-xs animate-in slide-in-from-top duration-200 z-20">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">Sesión Pomodoro Activa</span>
              <span className="text-indigo-200">25 min estudio / 5 min descanso</span>
            </div>
            <button
              onClick={() => setIsPomodoroActive(false)}
              className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-indigo-100 font-semibold"
            >
              Ocultar barra
            </button>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 no-print">
          {currentSection === 'dashboard' && (
            <Dashboard
              data={data}
              onNavigate={(sec) => setCurrentSection(sec)}
              onToggleTaskStatus={(taskId) => {
                updateAppData((prev) => ({
                  ...prev,
                  tasks: prev.tasks.map((t) =>
                    t.id === taskId
                      ? {
                          ...t,
                          status: t.status === 'completada' ? 'pendiente' : 'completada',
                        }
                      : t
                  ),
                }));
              }}
              onUpdateQuote={(newQuote) => {
                updateAppData((prev) => {
                  const quotes = [...prev.settings.motivationalQuotes];
                  quotes[prev.settings.activeQuoteIndex] = newQuote;
                  return {
                    ...prev,
                    settings: { ...prev.settings, motivationalQuotes: quotes },
                  };
                });
              }}
              onSelectTopic={(topicId) => setSelectedTopicId(topicId)}
            />
          )}

          {currentSection === 'syllabus' && (
            <SyllabusSection
              data={data}
              onSelectTopic={(topicId) => setSelectedTopicId(topicId)}
              onAddTopic={(newTopic) => {
                updateAppData((prev) => ({
                  ...prev,
                  topics: [...prev.topics, newTopic as Topic],
                }));
              }}
            />
          )}

          {currentSection === 'files' && (
            <FilesAndLinksSection
              data={data}
              onAddFile={(file) => {
                updateAppData((prev) => ({
                  ...prev,
                  files: [file, ...prev.files],
                }));
              }}
              onDeleteFile={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  files: prev.files.filter((f) => f.id !== id),
                }));
                dbService.deleteFileBlob(id).catch(console.error);
              }}
              onAddLink={(link) => {
                updateAppData((prev) => ({
                  ...prev,
                  links: [link, ...prev.links],
                }));
              }}
              onDeleteLink={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  links: prev.links.filter((l) => l.id !== id),
                }));
              }}
            />
          )}

          {currentSection === 'notes' && (
            <NotesSection
              data={data}
              activeNoteId={activeNoteId}
              onSaveNote={(updatedNote) => {
                updateAppData((prev) => {
                  const exists = prev.notes.some((n) => n.id === updatedNote.id);
                  return {
                    ...prev,
                    notes: exists
                      ? prev.notes.map((n) => (n.id === updatedNote.id ? updatedNote : n))
                      : [updatedNote, ...prev.notes],
                  };
                });
              }}
              onDeleteNote={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  notes: prev.notes.filter((n) => n.id !== id),
                }));
              }}
            />
          )}

          {currentSection === 'flashcards' && (
            <FlashcardsSection
              data={data}
              onUpdateFlashcard={(card) => {
                updateAppData((prev) => ({
                  ...prev,
                  flashcards: prev.flashcards.map((f) => (f.id === card.id ? card : f)),
                }));
              }}
              onAddFlashcard={(card) => {
                updateAppData((prev) => ({
                  ...prev,
                  flashcards: [card, ...prev.flashcards],
                }));
              }}
              onBatchImportFlashcards={(cards) => {
                updateAppData((prev) => ({
                  ...prev,
                  flashcards: [...cards, ...prev.flashcards],
                }));
              }}
            />
          )}

          {currentSection === 'tests' && (
            <TestsSection
              data={data}
              onAddError={(err) => {
                updateAppData((prev) => ({
                  ...prev,
                  failedQuestions: [err, ...prev.failedQuestions],
                }));
              }}
              onDeleteError={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  failedQuestions: prev.failedQuestions.filter((e) => e.id !== id),
                }));
              }}
              onConvertErrorToFlashcard={(err) => {
                const newFc: Flashcard = {
                  id: `fc-from-err-${Date.now()}`,
                  topicId: err.topicId,
                  front: err.questionText,
                  back: `Respuesta correcta: ${err.options[err.correctAnswerIndex]}\n\nExplicación: ${err.explanation}`,
                  tags: ['De Error Test'],
                  interval: 1,
                  repetition: 0,
                  easeFactor: 2.5,
                  nextReview: new Date().toISOString(),
                  reviewCount: 0,
                  failCount: 1,
                  state: 'new',
                };
                updateAppData((prev) => ({
                  ...prev,
                  flashcards: [newFc, ...prev.flashcards],
                }));
              }}
              onAddMockExam={(mock) => {
                updateAppData((prev) => ({
                  ...prev,
                  mockExams: [...prev.mockExams, mock],
                }));
              }}
              onDeleteMockExam={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  mockExams: prev.mockExams.filter((m) => m.id !== id),
                }));
              }}
            />
          )}

          {currentSection === 'askable' && (
            <MostAskableSection
              data={data}
              onToggleMastered={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  askableItems: prev.askableItems.map((a) =>
                    a.id === id ? { ...a, mastered: !a.mastered } : a
                  ),
                }));
              }}
              onAddAskable={(item) => {
                updateAppData((prev) => ({
                  ...prev,
                  askableItems: [item, ...prev.askableItems],
                }));
              }}
            />
          )}

          {currentSection === 'mnemonics' && (
            <MnemonicsSection
              data={data}
              onAddTechnique={(tech) => {
                updateAppData((prev) => ({
                  ...prev,
                  memoryTechniques: [tech, ...prev.memoryTechniques],
                }));
              }}
            />
          )}

          {currentSection === 'audio' && (
            <AudioSection
              data={data}
              onAddTrack={(tr) => {
                updateAppData((prev) => ({
                  ...prev,
                  audioTracks: [tr, ...prev.audioTracks],
                }));
              }}
              onDeleteTrack={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  audioTracks: prev.audioTracks.filter((t) => t.id !== id),
                }));
              }}
            />
          )}

          {currentSection === 'planner' && (
            <PlannerSection
              data={data}
              onAddTask={(t) => {
                updateAppData((prev) => ({
                  ...prev,
                  tasks: [...prev.tasks, t],
                }));
              }}
              onUpdateTask={(t) => {
                updateAppData((prev) => ({
                  ...prev,
                  tasks: prev.tasks.map((task) => (task.id === t.id ? t : task)),
                }));
              }}
              onDeleteTask={(id) => {
                updateAppData((prev) => ({
                  ...prev,
                  tasks: prev.tasks.filter((t) => t.id !== id),
                }));
              }}
              onLogStudySession={handleLogStudySession}
              onScheduleSpacedRepetition={handleScheduleSpacedRepetition}
            />
          )}

          {currentSection === 'stats' && <StatsSection data={data} />}

          {currentSection === 'laws' && (
            <LawsSection
              data={data}
              onUpdateLaw={(law) => {
                updateAppData((prev) => ({
                  ...prev,
                  laws: prev.laws.map((l) => (l.id === law.id ? law : l)),
                }));
              }}
              onAddLaw={(law) => {
                updateAppData((prev) => ({
                  ...prev,
                  laws: [...prev.laws, law],
                }));
              }}
            />
          )}

          {currentSection === 'settings' && (
            <SettingsSection
              settings={data.settings}
              data={data}
              onUpdateSettings={(newSt) => {
                updateAppData((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, ...newSt },
                }));
              }}
              onSyncDriveNow={handleSyncNow}
              onConnectDrive={handleConnectDrive}
              onDisconnectDrive={handleDisconnectDrive}
              onImportBackupJSON={(json) => {
                updateAppData(() => json);
                alert('¡Copia de seguridad restaurada correctamente!');
              }}
              onResetAllData={() => {
                updateAppData(() => INITIAL_DATA);
                alert('Datos restablecidos.');
              }}
              onOpenDriveGuide={() => setShowDriveGuide(true)}
            />
          )}
        </main>
      </div>

      {/* MODAL 1: Topic Detail Modal (with all 9 tabs) */}
      {activeTopicObj && (
        <TopicDetailModal
          topic={activeTopicObj}
          data={data}
          onClose={() => setSelectedTopicId(null)}
          onUpdateTopic={(updated) => {
            updateAppData((prev) => ({
              ...prev,
              topics: prev.topics.map((t) => (t.id === updated.id ? updated : t)),
            }));
          }}
          onOpenNote={(note) => {
            setActiveNoteId(note.id);
            setSelectedTopicId(null);
            setCurrentSection('notes');
          }}
          onNewNoteForTopic={(tId) => {
            const newN: Note = {
              id: `note-${Date.now()}`,
              topicId: tId,
              title: `Apuntes: ${activeTopicObj.shortTitle}`,
              contentHtml: '<p>Empieza a escribir tus notas aquí...</p>',
              folder: 'Temario',
              tags: ['Tema'],
              isPinned: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            updateAppData((prev) => ({ ...prev, notes: [newN, ...prev.notes] }));
            setActiveNoteId(newN.id);
            setSelectedTopicId(null);
            setCurrentSection('notes');
          }}
          onPracticeFlashcards={(tId) => {
            setSelectedTopicId(null);
            setCurrentSection('flashcards');
          }}
          onPracticeErrors={(tId) => {
            setSelectedTopicId(null);
            setCurrentSection('tests');
          }}
          onToggleAskableMastered={(askId) => {
            updateAppData((prev) => ({
              ...prev,
              askableItems: prev.askableItems.map((a) =>
                a.id === askId ? { ...a, mastered: !a.mastered } : a
              ),
            }));
          }}
          onScheduleSpacedRepetition={handleScheduleSpacedRepetition}
        />
      )}

      {/* MODAL 2: Quick Add Modal (+) */}
      {showQuickAdd && (
        <QuickAddModal
          data={data}
          onClose={() => setShowQuickAdd(false)}
          onAddNote={(n) => {
            updateAppData((prev) => ({ ...prev, notes: [n, ...prev.notes] }));
            setActiveNoteId(n.id);
            setCurrentSection('notes');
          }}
          onAddFlashcard={(fc) => {
            updateAppData((prev) => ({ ...prev, flashcards: [fc, ...prev.flashcards] }));
          }}
          onAddError={(err) => {
            updateAppData((prev) => ({ ...prev, failedQuestions: [err, ...prev.failedQuestions] }));
          }}
          onAddTask={(task) => {
            updateAppData((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
          }}
          onAddAskable={(ask) => {
            updateAppData((prev) => ({ ...prev, askableItems: [ask, ...prev.askableItems] }));
          }}
        />
      )}

      {/* MODAL 3: Drive Setup & Non-Programmer Guide Modal */}
      {showDriveGuide && <DriveGuideModal onClose={() => setShowDriveGuide(false)} />}

      {/* MODAL 4: Onboarding Walkthrough */}
      {showOnboarding && (
        <OnboardingModal
          onClose={() => setShowOnboarding(false)}
          onOpenDriveGuide={() => {
            setShowOnboarding(false);
            setShowDriveGuide(true);
          }}
        />
      )}

      {/* Offline Status Badge */}
      <OfflineIndicator />
    </div>
  );
}
