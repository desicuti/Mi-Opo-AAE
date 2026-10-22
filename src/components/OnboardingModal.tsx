import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ChevronRight, BookOpen, Layers, Cloud } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onOpenDriveGuide: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, onOpenDriveGuide }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: '¡Bienvenida a MiOpo AAE!',
      subtitle: 'Tu espacio integral para conseguir tu plaza de Auxiliar Administrativo del Estado.',
      description: 'Todo lo que necesitas en un único lugar: los 36 temas oficiales precargados, flashcards con repetición espaciada SM-2, registro de errores de test, planificador con cronómetro Pomodoro y sincronización con tu Google Drive.',
      icon: Sparkles,
      color: 'text-amber-500',
    },
    {
      title: 'El Temario Completo en tus Manos',
      subtitle: 'Bloque 1 (Org. Pública), Bloque 2 (Ofimática) y Bloque 3 (Psicotécnicos).',
      description: 'Cada tema es una ficha viva con 9 pestañas: apuntes con subrayadores por colores (plazos en naranja, órganos en lila, mayorías en verde), banco de errores, audios mnemotécnicos y lo más preguntable.',
      icon: BookOpen,
      color: 'text-indigo-600',
    },
    {
      title: 'Repetición Espaciada y Errores',
      subtitle: 'La ciencia de la memoria aplicada a tu estudio.',
      description: 'El algoritmo SM-2 calcula el momento exacto en que debes repasar cada flashcard. Y cuando falles una pregunta en un simulacro, anótala y conviértela en flashcard en un solo clic.',
      icon: Layers,
      color: 'text-purple-600',
    },
    {
      title: 'Tus Datos en Tu Propio Google Drive',
      subtitle: 'Sincronizado entre tu ordenador y tu móvil sin servidores externos.',
      description: 'Tus apuntes y archivos se guardan en IndexedDB localmente y en la carpeta «MiOpo AAE» de tu Drive. No enviamos tus datos a nadie más.',
      icon: Cloud,
      color: 'text-emerald-500',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step + 1 < steps.length) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 mx-auto flex items-center justify-center shadow-inner">
          <Icon className={`w-8 h-8 ${current.color}`} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {current.title}
          </h3>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {current.subtitle}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto pt-1">
            {current.description}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 pt-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === idx ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Saltar tutorial
          </button>

          <button
            onClick={handleNext}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
          >
            <span>{step + 1 === steps.length ? '¡Comenzar a estudiar!' : 'Siguiente'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
