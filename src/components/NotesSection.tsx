import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Folder,
  Tag,
  Printer,
  History,
  Trash2,
  Save,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Palette,
  Check,
} from 'lucide-react';
import { Note, AppData, HighlightPaletteItem } from '../types';

interface NotesSectionProps {
  data: AppData;
  activeNoteId?: string;
  onSaveNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  data,
  activeNoteId,
  onSaveNote,
  onDeleteNote,
}) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(() => {
    if (activeNoteId) {
      return data.notes.find((n) => n.id === activeNoteId) || data.notes[0] || null;
    }
    return data.notes[0] || null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('todas');
  const [selectedTag, setSelectedTag] = useState<string>('todas');
  const [showHistory, setShowHistory] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightPaletteItem>(
    data.settings.highlightPalette[0]
  );

  const editorRef = useRef<HTMLDivElement>(null);

  // Sync editor content when selected note changes
  useEffect(() => {
    if (selectedNote && editorRef.current) {
      if (editorRef.current.innerHTML !== selectedNote.contentHtml) {
        editorRef.current.innerHTML = selectedNote.contentHtml;
      }
    }
  }, [selectedNote?.id]);

  // Extract unique folders and tags
  const folders = Array.from(new Set(data.notes.map((n) => n.folder).filter(Boolean)));
  const tags = Array.from(new Set(data.notes.flatMap((n) => n.tags || [])));

  // Filter notes
  const filteredNotes = data.notes.filter((note) => {
    if (selectedFolder !== 'todas' && note.folder !== selectedFolder) return false;
    if (selectedTag !== 'todas' && (!note.tags || !note.tags.includes(selectedTag))) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = note.title.toLowerCase().includes(q);
      const matchContent = note.contentHtml.toLowerCase().includes(q);
      if (!matchTitle && !matchContent) return false;
    }
    return true;
  });

  // Sort: pinned first, then newest
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleCreateNote = () => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Nota sin título',
      contentHtml: '<p>Empieza a escribir tus apuntes aquí...</p>',
      folder: 'General',
      tags: ['Temario'],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [],
    };
    onSaveNote(newNote);
    setSelectedNote(newNote);
  };

  const handleEditorInput = () => {
    if (!selectedNote || !editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    const updated = {
      ...selectedNote,
      contentHtml: newHtml,
      updatedAt: new Date().toISOString(),
    };
    setSelectedNote(updated);
    onSaveNote(updated);
  };

  const handleExecCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Apply custom highlight palette color to selected text
  const applyHighlight = (paletteItem: HighlightPaletteItem) => {
    setActiveHighlightColor(paletteItem);
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = paletteItem.color;
    span.style.color = paletteItem.textColor;
    span.style.padding = '0.1rem 0.25rem';
    span.style.borderRadius = '0.25rem';
    span.style.fontWeight = '500';
    span.title = paletteItem.meaning;
    span.className = 'custom-highlight';

    try {
      range.surroundContents(span);
      handleEditorInput();
    } catch {
      // In case selection crosses nodes, fallback to standard backColor
      document.execCommand('backColor', false, paletteItem.color);
      handleEditorInput();
    }
  };

  const insertTable = () => {
    const tableHtml = `
      <table class="border-collapse border border-slate-300 dark:border-slate-700 my-2 w-full text-xs">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800">
            <th class="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left">Concepto</th>
            <th class="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left">Regulación / Órgano</th>
            <th class="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left">Plazo / Mayoría</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Dato 1</td>
            <td class="border border-slate-300 dark:border-slate-700 p-2">Art. XX</td>
            <td class="border border-slate-300 dark:border-slate-700 p-2">10 días</td>
          </tr>
        </tbody>
      </table>
    `;
    handleExecCommand('insertHTML', tableHtml);
  };

  const handlePrintNote = () => {
    window.print();
  };

  const handleSaveVersion = () => {
    if (!selectedNote) return;
    const historyList = selectedNote.history || [];
    const updatedNote = {
      ...selectedNote,
      history: [
        {
          timestamp: new Date().toISOString(),
          content: selectedNote.contentHtml,
        },
        ...historyList,
      ],
    };
    setSelectedNote(updatedNote);
    onSaveNote(updatedNote);
  };

  const handleRestoreVersion = (content: string) => {
    if (!selectedNote) return;
    const updated = {
      ...selectedNote,
      contentHtml: content,
      updatedAt: new Date().toISOString(),
    };
    setSelectedNote(updated);
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
    onSaveNote(updated);
    setShowHistory(false);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Anotaciones y Esquemas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Editor con paleta de subrayado por códigos de color oficial (plazos, órganos, mayorías...).
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nueva Nota
        </button>
      </div>

      {/* Main Split Layout: List on Left, Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* Left Column: Notes Browser */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en tus notas..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            {/* Folder filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedFolder('todas')}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedFolder === 'todas'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Todas ({data.notes.length})
              </button>
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFolder(f)}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                    selectedFolder === f
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  📁 {f}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="space-y-2 overflow-y-auto max-h-[520px] pr-1">
              {sortedNotes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No se encontraron notas.</p>
              ) : (
                sortedNotes.map((note) => {
                  const isSelected = selectedNote?.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-3 rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {note.title || 'Nota sin título'}
                        </h4>
                        {note.isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-1">
                        {note.contentHtml.replace(/<[^>]*>?/gm, '') || 'Sin contenido'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span>📁 {note.folder}</span>
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Rich Text Note Editor */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs">
          {selectedNote ? (
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Note Metadata Header (Title, Folder, Pin, Actions) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <input
                  type="text"
                  value={selectedNote.title}
                  onChange={(e) => {
                    const updated = { ...selectedNote, title: e.target.value };
                    setSelectedNote(updated);
                    onSaveNote(updated);
                  }}
                  placeholder="Título de la nota..."
                  className="text-lg md:text-xl font-black text-slate-900 dark:text-white bg-transparent border-none focus:outline-none w-full"
                />

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      const updated = { ...selectedNote, isPinned: !selectedNote.isPinned };
                      setSelectedNote(updated);
                      onSaveNote(updated);
                    }}
                    className={`p-2 rounded-xl border transition ${
                      selectedNote.isPinned
                        ? 'bg-amber-50 border-amber-300 text-amber-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                    }`}
                    title={selectedNote.isPinned ? 'Desfijar nota' : 'Fijar nota arriba'}
                  >
                    <Pin className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-amber-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Historial de versiones"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePrintNote}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Imprimir o Guardar como PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar esta nota?')) {
                        onDeleteNote(selectedNote.id);
                        setSelectedNote(data.notes.find((n) => n.id !== selectedNote.id) || null);
                      }
                    }}
                    className="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Eliminar nota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-bar: Folder & Topic linking */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={selectedNote.folder}
                    onChange={(e) => {
                      const updated = { ...selectedNote, folder: e.target.value };
                      setSelectedNote(updated);
                      onSaveNote(updated);
                    }}
                    placeholder="Carpeta..."
                    className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Tema:</span>
                  <select
                    value={selectedNote.topicId || ''}
                    onChange={(e) => {
                      const updated = { ...selectedNote, topicId: e.target.value || undefined };
                      setSelectedNote(updated);
                      onSaveNote(updated);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 max-w-[200px] truncate"
                  >
                    <option value="">(Sin vincular a tema)</option>
                    {data.topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleSaveVersion}
                  className="ml-auto text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  + Guardar punto de restauración
                </button>
              </div>

              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleExecCommand('bold')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Negrita (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExecCommand('italic')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Cursiva (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExecCommand('underline')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Subrayado (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                <button
                  onClick={() => handleExecCommand('formatBlock', '<h1>')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Título 1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExecCommand('formatBlock', '<h2>')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Título 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                <button
                  onClick={() => handleExecCommand('insertUnorderedList')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Lista con viñetas"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExecCommand('insertOrderedList')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Lista numerada"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleExecCommand('formatBlock', '<blockquote>')}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Cita"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  onClick={insertTable}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  title="Insertar tabla"
                >
                  <TableIcon className="w-4 h-4" />
                </button>

                {/* Subrayadores de Color (Highlight Palette Bar) */}
                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                <span className="text-[11px] font-bold text-slate-500 uppercase mr-1 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" /> Subrayador:
                </span>
                <div className="flex items-center gap-1">
                  {data.settings.highlightPalette.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => applyHighlight(item)}
                      style={{ backgroundColor: item.color }}
                      className="w-5 h-5 rounded-md border border-black/20 hover:scale-110 transition shadow-xs flex items-center justify-center cursor-pointer"
                      title={`${item.name}: ${item.meaning} (selecciona texto y haz clic)`}
                    >
                      {activeHighlightColor.id === item.id && (
                        <Check className="w-3 h-3 text-slate-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Version History Drawer (if open) */}
              {showHistory && (
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900 space-y-2 text-xs">
                  <h5 className="font-bold text-indigo-900 dark:text-indigo-300">
                    Puntos de restauración anteriores
                  </h5>
                  {(!selectedNote.history || selectedNote.history.length === 0) ? (
                    <p className="text-slate-500">No hay versiones guardadas aún.</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedNote.history.map((ver, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900"
                        >
                          <span>{new Date(ver.timestamp).toLocaleString()}</span>
                          <button
                            onClick={() => handleRestoreVersion(ver.content)}
                            className="text-indigo-600 font-bold hover:underline"
                          >
                            Restaurar esta versión
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Editable Content Area */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="flex-1 min-h-[360px] p-4 rounded-2xl bg-slate-50/40 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 focus:outline-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed overflow-y-auto font-sans prose dark:prose-invert max-w-none"
              />

              {/* Word and character count */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>
                  {editorRef.current?.innerText?.trim() ? editorRef.current.innerText.trim().split(/\s+/).length : 0} palabras
                </span>
                <span>Última modificación: {new Date(selectedNote.updatedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm py-12">
              <FileText className="w-12 h-12 text-slate-300 mb-2 stroke-1" />
              <p>Selecciona una nota para verla o editarla</p>
              <button
                onClick={handleCreateNote}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
              >
                + Crear primera nota
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
