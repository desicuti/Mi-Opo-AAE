import React, { useState, useRef, useEffect } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Bookmark,
  Plus,
  Volume2,
  Mic,
  Square,
  FileAudio,
  Trash2,
  Clock,
} from 'lucide-react';
import { AudioTrack, AppData } from '../types';

interface AudioSectionProps {
  data: AppData;
  onAddTrack: (track: AudioTrack) => void;
  onDeleteTrack: (id: string) => void;
}

export const AudioSection: React.FC<AudioSectionProps> = ({
  data,
  onAddTrack,
  onDeleteTrack,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('todas');
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(
    data.audioTracks[0] || null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);

  // New Bookmark input
  const [bookmarkNote, setBookmarkNote] = useState('');

  // Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Modal New Audio
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLyrics, setNewLyrics] = useState('');
  const [newPlaylist, setNewPlaylist] = useState<AudioTrack['playlist']>('paseo');
  const [newTopicId, setNewTopicId] = useState(data.topics[0]?.id || 'b1-t1');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filtered tracks
  const filteredTracks = data.audioTracks.filter((t) => {
    if (selectedPlaylist !== 'todas' && t.playlist !== selectedPlaylist) return false;
    return true;
  });

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => {
        console.warn('Playback error', e);
        setIsPlaying(false);
      });
    }
  };

  // Change track
  const handleSelectTrack = (track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);
    setLoopStart(null);
    setLoopEnd(null);
  };

  // Time update and loop listener
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    setCurrentTime(current);

    // If A-B loop is active
    if (isLooping && loopStart !== null && loopEnd !== null) {
      if (current >= loopEnd) {
        audioRef.current.currentTime = loopStart;
      }
    }
  };

  // Add bookmark
  const handleAddBookmark = () => {
    if (!currentTrack || !bookmarkNote.trim()) return;
    const newBm = {
      id: `bm-${Date.now()}`,
      time: Math.floor(currentTime),
      note: bookmarkNote.trim(),
    };
    currentTrack.bookmarks = [...(currentTrack.bookmarks || []), newBm];
    setBookmarkNote('');
  };

  // Microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      alert('No se pudo acceder al micrófono para grabar.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Record timer tick
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Save recorded track
  const handleSaveRecording = () => {
    if (!recordedBlob) return;
    const audioUrl = URL.createObjectURL(recordedBlob);
    const newTrack: AudioTrack = {
      id: `aud-${Date.now()}`,
      title: newTitle.trim() || `Grabación personal (${new Date().toLocaleDateString()})`,
      audioUrl,
      duration: recordingSeconds,
      playlist: newPlaylist,
      topicId: newTopicId,
      lyrics: newLyrics.trim() || undefined,
      bookmarks: [],
      createdAt: new Date().toISOString(),
    };
    onAddTrack(newTrack);
    setCurrentTrack(newTrack);
    setRecordedBlob(null);
    setShowAddModal(false);
  };

  const handleCreateUrlTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTrack: AudioTrack = {
      id: `aud-${Date.now()}`,
      title: newTitle.trim(),
      audioUrl: newUrl.trim() || undefined,
      duration: 180,
      playlist: newPlaylist,
      topicId: newTopicId,
      lyrics: newLyrics.trim() || undefined,
      bookmarks: [],
      createdAt: new Date().toISOString(),
    };

    onAddTrack(newTrack);
    setShowAddModal(false);
    setNewTitle('');
    setNewUrl('');
    setNewLyrics('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-indigo-600" /> Audios y Canciones Mnemotécnicas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Escucha temario y canciones de camino al trabajo, antes de dormir o durante el paseo con velocidad regulable y repetición en bucle.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Añadir o Grabar Audio
        </button>
      </div>

      {/* Main Grid: Player on Top / Left, Playlist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Player Card */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          {currentTrack ? (
            <>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full">
                  Lista: {currentTrack.playlist}
                </span>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                  {currentTrack.title}
                </h3>
              </div>

              {/* Native Audio Tag (hidden or controlled) */}
              {currentTrack.audioUrl && (
                <audio
                  ref={audioRef}
                  src={currentTrack.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || currentTrack.duration)}
                  onEnded={() => setIsPlaying(false)}
                />
              )}

              {/* Progress Slider */}
              <div className="space-y-1.5">
                <input
                  type="range"
                  min="0"
                  max={duration || currentTrack.duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const t = parseFloat(e.target.value);
                    setCurrentTime(t);
                    if (audioRef.current) audioRef.current.currentTime = t;
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || currentTrack.duration)}</span>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {/* Playback rate */}
                <div className="flex items-center gap-1 text-xs">
                  {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        if (audioRef.current) audioRef.current.playbackRate = rate;
                      }}
                      className={`px-2 py-1 rounded-lg font-bold font-mono transition ${
                        playbackRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Main Play / Pause */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentTime - 10);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                    title="Retroceder 10s"
                  >
                    -10s
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      if (audioRef.current) audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
                    title="Adelantar 10s"
                  >
                    +10s
                  </button>
                </div>

                {/* A-B Loop Controls */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setLoopStart(currentTime)}
                    className={`px-2.5 py-1 rounded-lg border font-semibold ${
                      loopStart !== null ? 'bg-amber-100 text-amber-800 border-amber-300' : 'border-slate-200'
                    }`}
                    title="Fijar punto A de inicio del bucle"
                  >
                    A: {loopStart !== null ? formatTime(loopStart) : '--'}
                  </button>
                  <button
                    onClick={() => setLoopEnd(currentTime)}
                    className={`px-2.5 py-1 rounded-lg border font-semibold ${
                      loopEnd !== null ? 'bg-amber-100 text-amber-800 border-amber-300' : 'border-slate-200'
                    }`}
                    title="Fijar punto B de fin del bucle"
                  >
                    B: {loopEnd !== null ? formatTime(loopEnd) : '--'}
                  </button>
                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-1.5 rounded-lg border ${
                      isLooping ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-400'
                    }`}
                    title="Activar / Desactivar bucle A-B"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lyrics & Mnemonic Chorus */}
              {currentTrack.lyrics && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    Letra Mnemotécnica
                  </h4>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                    {currentTrack.lyrics}
                  </div>
                </div>
              )}

              {/* Timestamp Bookmarks with Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5" /> Marcadores de Tiempo
                  </h4>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bookmarkNote}
                    onChange={(e) => setBookmarkNote(e.target.value)}
                    placeholder={`Añadir nota en ${formatTime(currentTime)}...`}
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <button
                    onClick={handleAddBookmark}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold"
                  >
                    Marcar
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {currentTrack.bookmarks?.map((bm) => (
                    <div
                      key={bm.id}
                      onClick={() => {
                        if (audioRef.current) audioRef.current.currentTime = bm.time;
                        setCurrentTime(bm.time);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{bm.note}</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {formatTime(bm.time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-400 py-12">No hay ningún audio seleccionado.</p>
          )}
        </div>

        {/* Playlist & Library on Right */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Listas de Reproducción</h4>
          </div>

          {/* Playlist filter */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {(['todas', 'paseo', 'dormir', 'repaso-rapido', 'general'] as const).map((pl) => (
              <button
                key={pl}
                onClick={() => setSelectedPlaylist(pl)}
                className={`p-2 rounded-xl font-bold capitalize transition border text-left ${
                  selectedPlaylist === pl
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-transparent hover:bg-slate-100'
                }`}
              >
                {pl === 'paseo' ? '🚶 Para el paseo' : pl === 'dormir' ? '🌙 Antes de dormir' : pl === 'repaso-rapido' ? '⚡ Repaso rápido' : pl === 'todas' ? '🎧 Todas' : '📁 General'}
              </button>
            ))}
          </div>

          {/* Track list */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredTracks.map((tr) => {
              const isSelected = currentTrack?.id === tr.id;
              return (
                <div
                  key={tr.id}
                  onClick={() => handleSelectTrack(tr)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5 truncate max-w-[80%]">
                    <h5
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tr.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 capitalize block">{tr.playlist}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">{formatTime(tr.duration)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrack(tr.id);
                      }}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Añadir o Grabar Audio */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Añadir o Grabar Pista de Audio
            </h3>

            {/* Microphone recorder section */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-center space-y-3 mb-4">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
                🎙️ Graba tu propia voz recitando artículos o reglas
              </span>

              <div className="flex items-center justify-center gap-3">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Mic className="w-4 h-4" /> Iniciar Grabación
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-white" /> Detener ({recordingSeconds}s)
                  </button>
                )}
              </div>

              {recordedBlob && (
                <div className="text-xs text-emerald-600 font-bold">
                  ✓ Audio grabado ({recordingSeconds} segundos listo para guardar)
                </div>
              )}
            </div>

            {/* Track Info Form */}
            <form
              onSubmit={(e) => {
                if (recordedBlob) {
                  e.preventDefault();
                  handleSaveRecording();
                } else {
                  handleCreateUrlTrack(e);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Título del Audio
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Repaso de plazos del Procedimiento Común"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {!recordedBlob && (
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    URL del archivo de audio (MP3 / WAV / WebM)
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://... o deja vacío si es solo letra mnemotécnica"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Lista de Reproducción
                  </label>
                  <select
                    value={newPlaylist}
                    onChange={(e) => setNewPlaylist(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="paseo">Para el paseo</option>
                    <option value="dormir">Antes de dormir</option>
                    <option value="repaso-rapido">Repaso rápido</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Tema
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
                  Letra o Guión de Apoyo (opcional)
                </label>
                <textarea
                  rows={4}
                  value={newLyrics}
                  onChange={(e) => setNewLyrics(e.target.value)}
                  placeholder="Escribe aquí la letra de la canción o los puntos clave..."
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
                  Guardar Audio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
