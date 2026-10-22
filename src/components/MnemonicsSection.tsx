import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  BookOpen,
  Sparkles,
  HelpCircle,
  Copy,
  ChevronRight,
} from 'lucide-react';
import { MemoryTechnique, AppData } from '../types';

interface MnemonicsSectionProps {
  data: AppData;
  activeTopicId?: string;
  onAddTechnique: (item: MemoryTechnique) => void;
}

const TECHNIQUE_TEMPLATES: Record<
  MemoryTechnique['type'],
  { name: string; description: string; template: string }
> = {
  acronimo: {
    name: 'Acrónimo',
    description: 'Crea una palabra memorable usando la primera letra de cada elemento que necesitas recordar.',
    template: `**Palabra clave:** [EJEMPLO]
- **E** = Elemento 1
- **J** = Elemento 2
- **E** = Elemento 3
- **M** = Elemento 4
- **P** = Elemento 5
- **L** = Elemento 6
- **O** = Elemento 7`,
  },
  analogia: {
    name: 'Analogía',
    description: 'Compara un concepto abstracto del derecho o la informática con algo cotidiano y familiar.',
    template: `**Concepto oficial:** [Nombre del concepto legal]
**Comparación cotidiana:** [Es como...]

¿Por qué funciona la analogía?
1. Porque en la vida real...
2. Así como en la ley ocurre que...`,
  },
  historieta: {
    name: 'Historieta Surrealista',
    description: 'Narra una historia exagerada, absurda o graciosa donde intervienen los números, plazos u órganos.',
    template: `Imagina que vas caminando y de pronto...
Aparece un personaje disparatado con [un reloj que marca 10 días] y [una corona que representa al Rey]...
La historia continúa cuando...`,
  },
  palacio: {
    name: 'Palacio de la Memoria',
    description: 'Recorre mentalmente las habitaciones de una casa o edificio conocido ubicando cada dato en un mueble.',
    template: `**Edificio o Lugar:** Mi casa / La Moncloa / El Congreso

- **En la Puerta de entrada:** [Dato 1]
- **En el Recibidor:** [Dato 2]
- **En el Salón principal:** [Dato 3]
- **En la Cocina:** [Dato 4]
- **En el Balcón:** [Dato 5]`,
  },
  'nino-10': {
    name: 'Explícaselo a un niño de 10 años',
    description: 'Elimina la jerga jurídica y redacta el concepto con palabras tan sencillas que cualquiera lo entienda.',
    template: `Imagínate que en el colegio las normas dicen que...
Si haces esto, pasa lo siguiente...
Y no te preocupes por el palabro técnico, solo quédate con que...`,
  },
  mnemotecnica: {
    name: 'Regla Mnemotécnica',
    description: 'Rimas, juegos de palabras o trucos numéricos de asociación fonética.',
    template: `**Regla de oro:** "[Frase rimada o truco fonético]"
**Explicación:** Se asocia la palabra X con el número Y porque...`,
  },
  cancion: {
    name: 'Canción Mnemotécnica',
    description: 'Letra con métrica y ritmo para cantar mentalmente en el examen.',
    template: `(Al ritmo de una canción conocida: Despacito, La Macarena, etc.)
Verso 1: ...
Verso 2: ...
Estribillo: ...`,
  },
  mapa: {
    name: 'Mapa Mental Estructurado',
    description: 'Esquema radial con nodos centrales y ramificaciones jerárquicas.',
    template: `[CONCEPTO CENTRAL]
├── Rama 1: ...
│   ├── Subnodo A: ...
│   └── Subnodo B: ...
└── Rama 2: ...
    ├── Subnodo C: ...
    └── Subnodo D: ...`,
  },
};

export const MnemonicsSection: React.FC<MnemonicsSectionProps> = ({
  data,
  activeTopicId,
  onAddTechnique,
}) => {
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedTopic, setSelectedTopic] = useState<string>(activeTopicId || 'todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // New item state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MemoryTechnique['type']>('acronimo');
  const [newExplanation, setNewExplanation] = useState('');
  const [newContent, setNewContent] = useState(TECHNIQUE_TEMPLATES.acronimo.template);
  const [newTopicId, setNewTopicId] = useState(data.topics[0]?.id || 'b1-t1');

  // Change type in modal updates template
  const handleTypeChange = (t: MemoryTechnique['type']) => {
    setNewType(t);
    setNewContent(TECHNIQUE_TEMPLATES[t].template);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const technique: MemoryTechnique = {
      id: `tech-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      explanation: newExplanation.trim() || TECHNIQUE_TEMPLATES[newType].description,
      content: newContent.trim(),
      topicId: newTopicId,
      tags: [TECHNIQUE_TEMPLATES[newType].name],
    };

    onAddTechnique(technique);
    setShowAddModal(false);
    setNewTitle('');
    setNewExplanation('');
  };

  const filtered = data.memoryTechniques.filter((item) => {
    if (selectedType !== 'todos' && item.type !== selectedType) return false;
    if (selectedTopic !== 'todos' && item.topicId !== selectedTopic) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-500" /> Analogías y Técnicas de Memorización
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acrónimos, historietas, palacios de la memoria y analogías para recordar artículos difíciles sin esfuerzo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowGuideModal(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-4 h-4 text-amber-500" /> Biblioteca de Técnicas
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Crear Técnica
          </button>
        </div>
      </div>

      {/* Filter by technique type pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedType('todos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
            selectedType === 'todos'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          Todas ({data.memoryTechniques.length})
        </button>
        {Object.entries(TECHNIQUE_TEMPLATES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setSelectedType(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedType === key
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            {val.name}
          </button>
        ))}
      </div>

      {/* Technique Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const topicObj = data.topics.find((t) => t.id === item.topicId);
          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    {TECHNIQUE_TEMPLATES[item.type]?.name || item.type}
                  </span>
                  {topicObj && (
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {topicObj.shortTitle}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {item.explanation}
                </p>
              </div>

              {/* Content box */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-line leading-relaxed">
                {item.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Guía de Técnicas */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Biblioteca de Técnicas de Memorización
            </h3>
            <p className="text-xs text-slate-500">
              Usa estas 8 metodologías avaladas por la neurociencia para fijar datos en la oposición de Auxiliar Administrativo:
            </p>

            <div className="space-y-3">
              {Object.entries(TECHNIQUE_TEMPLATES).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                >
                  <h4 className="font-bold text-xs text-amber-700 dark:text-amber-400">{val.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{val.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Técnica */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Nueva Técnica Mnemotécnica
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tipo de Técnica
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => handleTypeChange(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-600"
                  >
                    {Object.entries(TECHNIQUE_TEMPLATES).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.name}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título de la Técnica
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Acrónimo F.I.S.C.O. para abstención y recusación"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  ¿Para qué sirve? (Explicación breve)
                </label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Para memorizar las 5 causas del art. 23 Ley 40/2015..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Contenido Mnemotécnico (Plantilla editable)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewContent(TECHNIQUE_TEMPLATES[newType].template)}
                    className="text-[11px] text-amber-600 hover:underline"
                  >
                    Restablecer plantilla
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed"
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
                  Guardar Técnica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
