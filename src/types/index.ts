export interface Topic {
  id: string;
  blockId: 'bloque-1' | 'bloque-2' | 'bloque-3';
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  status: 'sin-empezar' | 'estudiando' | 'estudiado' | 'repasado' | 'dominado';
  progress: number; // 0 to 100
  tags: string[];
  lastReviewed?: string;
  nextReviewDate?: string;
  studyMinutesTotal: number;
  subtopics?: string[];
}

export interface Block {
  id: 'bloque-1' | 'bloque-2' | 'bloque-3';
  title: string;
  shortTitle: string;
  description: string;
  badge: string;
  accentColor: string;
}

export interface Task {
  id: string;
  title: string;
  topicId?: string;
  blockId?: 'bloque-1' | 'bloque-2' | 'bloque-3';
  durationMinutes: number;
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'en-progreso' | 'completada';
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type: 'estudio' | 'repaso' | 'test' | 'psicotecnico' | 'pomodoro' | 'simulacro';
  completedAt?: string;
  notes?: string;
}

export interface Flashcard {
  id: string;
  topicId: string;
  blockId?: 'bloque-1' | 'bloque-2' | 'bloque-3';
  front: string;
  back: string;
  imageUrl?: string;
  tags: string[];
  // SM-2 fields
  interval: number; // days
  repetition: number;
  easeFactor: number; // default 2.5
  nextReview: string; // ISO date string
  lastReviewed?: string;
  reviewCount: number;
  failCount: number;
  state: 'new' | 'learning' | 'review';
}

export interface FailedQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  myAnswerIndex: number;
  topicId: string;
  reason: 'no-sabia' | 'confusion' | 'despiste' | 'lei-mal' | 'dudaba-dos';
  explanation: string;
  source: string; // e.g., "Examen AAE 2023", "Simulacro Adams nº 4", etc.
  createdAt: string;
  reviewedCount: number;
  isResolved?: boolean;
}

export interface MockExam {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'oficial' | 'temario-completo' | 'bloque-1' | 'bloque-2' | 'psicotecnicos';
  totalQuestions: number;
  correct: number;
  incorrect: number;
  blank: number;
  score: number; // Calculated net score
  penaltyFactor: number; // default 1/3 (0.3333)
  timeMinutes: number;
  notes?: string;
}

export interface AskableItem {
  id: string;
  topicId: string;
  category: 'articulo' | 'plazo' | 'numero' | 'mayoria' | 'organo' | 'excepcion';
  title: string;
  details: string;
  stars: 1 | 2 | 3;
  mastered: boolean;
  lawReference?: string;
}

export interface Note {
  id: string;
  topicId?: string;
  title: string;
  contentHtml: string;
  folder: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  history?: { timestamp: string; content: string }[];
}

export interface HighlightPaletteItem {
  id: string;
  name: string;
  color: string; // HEX code
  textColor: string;
  meaning: string;
}

export interface MemoryTechnique {
  id: string;
  title: string;
  topicId?: string;
  type: 'analogia' | 'historieta' | 'palacio' | 'mnemotecnica' | 'acronimo' | 'cancion' | 'mapa' | 'nino-10';
  explanation: string;
  content: string;
  imageUrl?: string;
  tags: string[];
}

export interface AudioTrack {
  id: string;
  title: string;
  topicId?: string;
  audioUrl?: string; // URL or object URL / base64
  fileName?: string;
  lyrics?: string;
  duration: number; // in seconds
  playlist: 'paseo' | 'dormir' | 'general' | 'repaso-rapido';
  bookmarks: { id: string; time: number; note: string }[];
  createdAt: string;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  topicId?: string;
  dataUrl?: string; // base64 or blob URL
  driveFileId?: string;
  tags: string[];
  uploadedAt: string;
}

export interface WebLink {
  id: string;
  title: string;
  url: string;
  description: string;
  topicId?: string;
  tags: string[];
  createdAt: string;
}

export interface LawResource {
  id: string;
  title: string;
  abbreviation: string;
  number: string;
  boeUrl: string;
  keyArticles: string;
  personalNotes: string;
  updatedAt: string;
}

export interface PomodoroSettings {
  workMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  soundEnabled: boolean;
}

export interface AppSettings {
  googleClientId: string;
  examDate?: string;
  dailyGoalMinutes: number;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  testPenaltyRatio: number; // default 0.33333 (1/3)
  highlightPalette: HighlightPaletteItem[];
  motivationalQuotes: string[];
  activeQuoteIndex: number;
  driveSyncStatus: 'sincronizado' | 'pendiente' | 'sin-conexion' | 'error' | 'desconectado';
  lastSyncTimestamp?: string;
  pomodoro: PomodoroSettings;
  streakDays: number;
  lastStudyDate?: string;
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  topicId?: string;
  type: 'pomodoro' | 'manual' | 'flashcards' | 'test' | 'audio';
  notes?: string;
}

export interface AppData {
  version: number;
  lastUpdated: string;
  topics: Topic[];
  tasks: Task[];
  flashcards: Flashcard[];
  failedQuestions: FailedQuestion[];
  mockExams: MockExam[];
  askableItems: AskableItem[];
  notes: Note[];
  memoryTechniques: MemoryTechnique[];
  audioTracks: AudioTrack[];
  files: FileItem[];
  links: WebLink[];
  laws: LawResource[];
  settings: AppSettings;
  studyLogs: StudySessionLog[];
}
