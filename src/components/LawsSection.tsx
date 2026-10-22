import React, { useState } from 'react';
import {
  Scale,
  ExternalLink,
  Edit2,
  Plus,
  Search,
  BookOpen,
  Check,
  Save,
} from 'lucide-react';
import { LawResource, AppData } from '../types';

interface LawsSectionProps {
  data: AppData;
  onUpdateLaw: (law: LawResource) => void;
  onAddLaw: (law: LawResource) => void;
}

export const LawsSection: React.FC<LawsSectionProps> = ({
  data,
  onUpdateLaw,
  onAddLaw,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLawId, setEditingLawId] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Law State
  const [newTitle, setNewTitle] = useState('');
  const [newAbbr, setNewAbbr] = useState('');
  const [newBoe, setNewBoe] = useState('');
  const [newArticles, setNewArticles] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredLaws = data.laws.filter((law) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      law.title.toLowerCase().includes(q) ||
      law.abbreviation.toLowerCase().includes(q) ||
      law.keyArticles.toLowerCase().includes(q) ||
      law.personalNotes.toLowerCase().includes(q)
    );
  });

  const handleStartEdit = (law: LawResource) => {
    setEditingLawId(law.id);
    setEditedNotes(law.personalNotes);
  };

  const handleSaveNotes = (law: LawResource) => {
    onUpdateLaw({
      ...law,
      personalNotes: editedNotes,
      updatedAt: new Date().toISOString(),
    });
    setEditingLawId(null);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAbbr.trim()) return;

    let boeUrl = newBoe.trim();
    if (boeUrl && !boeUrl.startsWith('http')) {
      boeUrl = `https://${boeUrl}`;
    }

    const created: LawResource = {
      id: `law-${Date.now()}`,
      title: newTitle.trim(),
      abbreviation: newAbbr.trim(),
      number: 'Consolidada',
      boeUrl: boeUrl || 'https://www.boe.es',
      keyArticles: newArticles.trim(),
      personalNotes: newNotes.trim(),
      updatedAt: new Date().toISOString(),
    };

    onAddLaw(created);
    setShowAddModal(false);
    setNewTitle('');
    setNewAbbr('');
    setNewBoe('');
    setNewArticles('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" /> Normativa y Códigos Oficiales
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Leyes clave de la oposición de Auxiliar Administrativo del Estado con enlaces directos a su texto consolidado en el BOE.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Añadir Ley al Repertorio
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar ley, artículo clave o notas personales..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:outline-none"
        />
      </div>

      {/* Laws List */}
      <div className="space-y-4">
        {filteredLaws.map((law) => {
          const isEditing = editingLawId === law.id;
          return (
            <div
              key={law.id}
              className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs">
                    {law.abbreviation}
                  </span>
                  <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
                    {law.title}
                  </h3>
                </div>

                <a
                  href={law.boeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  Texto Consolidado BOE <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Key Articles */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold text-[10px] uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider">
                  Artículos Imprescindibles en Examen
                </span>
                <p className="leading-relaxed">{law.keyArticles}</p>
              </div>

              {/* Personal Notes */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    Mis Notas y Mnemotecnias de esta Ley
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(law)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Edit2 className="w-3 h-3" /> Editar notas
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      className="w-full text-xs p-3 rounded-2xl border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingLawId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveNotes(law)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" /> Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/40">
                    {law.personalNotes || 'Sin notas añadidas todavía. Haz clic en "Editar notas" para anotar trucos.'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Añadir Ley */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Añadir Ley al Repertorio
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Nombre Oficial de la Ley
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Ley General Tributaria 58/2003"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Siglas / Abreviatura
                  </label>
                  <input
                    type="text"
                    required
                    value={newAbbr}
                    onChange={(e) => setNewAbbr(e.target.value)}
                    placeholder="Ej: LGT"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Enlace a Texto BOE
                  </label>
                  <input
                    type="url"
                    value={newBoe}
                    onChange={(e) => setNewBoe(e.target.value)}
                    placeholder="https://www.boe.es/..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Artículos Clave para Examen
                </label>
                <textarea
                  rows={2}
                  value={newArticles}
                  onChange={(e) => setNewArticles(e.target.value)}
                  placeholder="Arts. 1, 10, 15..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Notas Personales
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Anotaciones de trucos..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Guardar Ley
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
