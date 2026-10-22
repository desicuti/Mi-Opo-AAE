import React, { useState } from 'react';
import {
  FolderArchive,
  Upload,
  Link as LinkIcon,
  Plus,
  FileText,
  Image,
  ExternalLink,
  Trash2,
  Eye,
  X,
  Tag,
  Search,
} from 'lucide-react';
import { FileItem, WebLink, AppData } from '../types';
import { dbService } from '../services/db';

interface FilesAndLinksSectionProps {
  data: AppData;
  activeTopicId?: string;
  onAddFile: (fileItem: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onAddLink: (link: WebLink) => void;
  onDeleteLink: (linkId: string) => void;
}

export const FilesAndLinksSection: React.FC<FilesAndLinksSectionProps> = ({
  data,
  activeTopicId,
  onAddFile,
  onDeleteFile,
  onAddLink,
  onDeleteLink,
}) => {
  const [activeTab, setActiveTab] = useState<'archivos' | 'enlaces'>('archivos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>(activeTopicId || 'todos');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // New Link Modal State
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  const [newLinkTopic, setNewLinkTopic] = useState(data.topics[0]?.id || '');
  const [newLinkTags, setNewLinkTags] = useState('Oficial');

  // Handle Drag & Drop / File selection
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file-${Date.now()}-${i}`;

      // Convert to dataUrl for preview and local storage
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const newFileItem: FileItem = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          topicId: selectedTopic !== 'todos' ? selectedTopic : undefined,
          dataUrl,
          tags: [file.name.split('.').pop()?.toUpperCase() || 'DOC'],
          uploadedAt: new Date().toISOString(),
        };

        // Save to IndexedDB file vault
        await dbService.saveFileBlob(fileId, file, newFileItem);
        onAddFile(newFileItem);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    let url = newLinkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    const created: WebLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url,
      description: newLinkDesc.trim(),
      topicId: newLinkTopic || undefined,
      tags: newLinkTags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    onAddLink(created);
    setShowAddLinkModal(false);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setNewLinkDesc('');
  };

  const filteredFiles = data.files.filter((f) => {
    if (selectedTopic !== 'todos' && f.topicId !== selectedTopic) return false;
    if (searchQuery.trim() && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredLinks = data.links.filter((l) => {
    if (selectedTopic !== 'todos' && l.topicId !== selectedTopic) return false;
    if (searchQuery.trim() && !l.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FolderArchive className="w-6 h-6 text-indigo-600" /> Archivos y Enlaces de Estudio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sube PDFs oficiales, esquemas en imagen y enlaces a portales administrativos vinculados a cada tema.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === 'archivos' ? (
            <label className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer">
              <Upload className="w-4 h-4" /> Subir Archivo
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp3,.wav"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          ) : (
            <button
              onClick={() => setShowAddLinkModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Guardar Enlace
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('archivos')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
            activeTab === 'archivos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Archivos y PDFs ({data.files.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('enlaces')}
          className={`py-3 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 ${
            activeTab === 'enlaces'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Enlaces Web y Portales ({data.links.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o palabra clave..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
          />
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-xs w-full sm:w-72"
        >
          <option value="todos">Todos los temas</option>
          {data.topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.shortTitle}
            </option>
          ))}
        </select>
      </div>

      {/* TAB 1: ARCHIVOS */}
      {activeTab === 'archivos' && (
        <div className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-indigo-300 dark:border-indigo-900/60 rounded-3xl p-8 text-center bg-indigo-50/20 dark:bg-indigo-950/10 hover:bg-indigo-50/40 transition cursor-pointer"
          >
            <Upload className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
            <p className="font-bold text-xs text-slate-700 dark:text-slate-200">
              Arrastra y suelta tus archivos aquí (PDF, Word, Esquemas PNG/JPG, Audios)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Se almacenan en el baúl seguro de IndexedDB en tu navegador y se sincronizan con Google Drive.
            </p>
          </div>

          {/* Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => {
              const isPdf = file.name.endsWith('.pdf');
              const isImg = file.type.startsWith('image/');
              return (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                        {isImg ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {file.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {(file.size / 1024).toFixed(0)} KB • {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="text-slate-300 hover:text-rose-500 p-1"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {file.tags[0] || 'DOC'}
                    </span>

                    {file.dataUrl && (
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Vista Previa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ENLACES */}
      {activeTab === 'enlaces' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    {link.title}
                  </h4>
                  <button
                    onClick={() => onDeleteLink(link.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                    title="Eliminar enlace"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{link.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-1">
                  {link.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  Abrir <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal for PDF / Image */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 rounded-3xl p-5 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {previewFile.name}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 mt-3 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.dataUrl}
                  alt={previewFile.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <iframe
                  src={previewFile.dataUrl}
                  title={previewFile.name}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Guardar Enlace */}
      {showAddLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Guardar Nuevo Enlace Web
            </h3>
            <form onSubmit={handleCreateLink} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título del Recurso
                </label>
                <input
                  type="text"
                  required
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Ej: Punto de Acceso General (PAG)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  URL Web
                </label>
                <input
                  type="text"
                  required
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://administracion.gob.es"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newLinkDesc}
                  onChange={(e) => setNewLinkDesc(e.target.value)}
                  placeholder="Portal oficial con trámites ciudadanos..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLinkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Guardar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
