import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle } from 'lucide-react';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface PomodoroWidgetProps {
  workMinutes: number;
  breakMinutes: number;
  onSessionComplete?: (minutes: number) => void;
  soundEnabled: boolean;
  topicTitle?: string;
}

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  workMinutes = 25,
  breakMinutes = 5,
  onSessionComplete,
  soundEnabled = true,
  topicTitle,
}) => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [muted, setMuted] = useState(!soundEnabled);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Reset timer when initial settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
    }
  }, [workMinutes, breakMinutes, mode, isRunning]);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Session finished
      if (!muted) {
        sound.playBell();
      }

      if (mode === 'work') {
        confetti({ particleCount: 40, spread: 60 });
        setCompletedSessions((prev) => prev + 1);
        if (onSessionComplete) {
          onSessionComplete(workMinutes);
        }
        setMode('break');
        setTimeLeft(breakMinutes * 60);
      } else {
        setMode('work');
        setTimeLeft(workMinutes * 60);
      }
      setIsRunning(false);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, workMinutes, breakMinutes, muted, onSessionComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? workMinutes * 60 : breakMinutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const totalSeconds = mode === 'work' ? workMinutes * 60 : breakMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${mode === 'work' ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-500'}`} />
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            {mode === 'work' ? 'Pomodoro: Sesión de Estudio' : 'Descanso Merecido'}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setMuted(!muted)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={muted ? 'Activar sonido' : 'Silenciar campana'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
          </button>
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-indigo-600" /> {completedSessions}
          </span>
        </div>
      </div>

      {topicTitle && (
        <div className="mb-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
          🎯 {topicTitle}
        </div>
      )}

      {/* Circular Progress & Digital Display */}
      <div className="flex flex-col items-center justify-center my-3">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={mode === 'work' ? 'text-indigo-600 dark:text-indigo-500' : 'text-emerald-500'}
              strokeWidth="7"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (progressPercent / 100) * 276.46}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white font-mono">
              {formattedTime}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {mode === 'work' ? 'Estudiando' : 'Descanso'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Reiniciar temporizador"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          {isRunning ? 'Pausar' : 'Iniciar Pomodoro'}
        </button>

        <button
          onClick={() => {
            setMode(mode === 'work' ? 'break' : 'work');
            setTimeLeft(mode === 'work' ? breakMinutes * 60 : workMinutes * 60);
            setIsRunning(false);
          }}
          className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {mode === 'work' ? 'Ir a descanso' : 'Ir a estudio'}
        </button>
      </div>
    </div>
  );
};
