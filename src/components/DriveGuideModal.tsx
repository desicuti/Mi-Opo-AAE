import React from 'react';
import {
  X,
  BookOpen,
  Cloud,
  CheckCircle2,
  Copy,
  ExternalLink,
  Smartphone,
  Globe,
  Sparkles,
} from 'lucide-react';

interface DriveGuideModalProps {
  onClose: () => void;
}

export const DriveGuideModal: React.FC<DriveGuideModalProps> = ({ onClose }) => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copiado al portapapeles: ${text}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
                Guía de Puesta en Marcha (Para No Programadores)
              </h2>
              <p className="text-xs text-slate-500">
                Paso a paso para configurar Google Drive, publicar gratis e instalarla en tu móvil.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="overflow-y-auto flex-1 py-6 space-y-8 text-xs md:text-sm text-slate-700 dark:text-slate-300 pr-1 leading-relaxed">
          {/* PASO 1: GOOGLE CLOUD & DRIVE OAUTH */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Crear tu ID de Cliente en Google Cloud (5 minutos, 100% gratis)</span>
            </div>

            <ol className="space-y-2.5 list-decimal list-inside bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <li>
                Entra en{' '}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  Google Cloud Console <ExternalLink className="w-3 h-3" />
                </a>{' '}
                con tu cuenta de Google habitual.
              </li>
              <li>
                Arriba a la izquierda, pulsa en el desplegable de proyectos y haz clic en{' '}
                <strong>«Proyecto Nuevo»</strong> (ponle de nombre por ejemplo <em>MiOpo AAE</em>) y pulsa Crear.
              </li>
              <li>
                En el buscador superior escribe <strong>«Google Drive API»</strong>, selecciónala y pulsa el botón azul{' '}
                <strong>«Habilitar»</strong>.
              </li>
              <li>
                En el menú lateral izquierdo ve a <strong>APIs y servicios &gt; Pantalla de consentimiento de OAuth</strong>.
                Selecciona tipo <strong>«Externo»</strong> y pulsa Crear. Rellena el nombre de la app (<em>MiOpo AAE</em>) y tu correo. En el paso de Permisos, puedes continuar sin añadir nada. En «Usuarios de prueba», añade tu propio correo de Gmail.
              </li>
              <li>
                Ve a <strong>APIs y servicios &gt; Credenciales</strong>. Pulsa arriba en <strong>«+ Crear credenciales»</strong> y elige{' '}
                <strong>«ID de cliente de OAuth»</strong>.
              </li>
              <li>
                En tipo de aplicación selecciona <strong>«Aplicación web»</strong>.
              </li>
              <li>
                En el apartado <strong>«Orígenes autorizados de JavaScript»</strong>, pulsa «+ Añadir URI» y pega exactamente la URL de donde tienes abierta esta app:
                <div className="flex items-center gap-2 mt-1.5 p-2 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <code className="font-mono text-xs text-indigo-600 dark:text-indigo-400 flex-1 truncate">
                    {currentOrigin}
                  </code>
                  <button
                    onClick={() => copyToClipboard(currentOrigin)}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copiar
                  </button>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  (Si más adelante la subes a Netlify o GitHub Pages, añade también esa URL aquí).
                </span>
              </li>
              <li>
                Pulsa <strong>Crear</strong>. Aparecerá una ventana con tu <strong>ID de cliente</strong> (algo como <code>123456789-abcdef.apps.googleusercontent.com</code>). Cópialo.
              </li>
            </ol>
          </div>

          {/* PASO 2: DÓNDE PEGARLO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Dónde pegar tu Client ID</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <p>Tienes dos formas súper sencillas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Desde la propia aplicación:</strong> Ve al menú lateral <strong>«Ajustes»</strong>, pega tu ID en el campo correspondiente y pulsa «Guardar Client ID».
                </li>
                <li>
                  <strong>En el código fuente:</strong> Abre el archivo <code>src/services/googleDrive.ts</code> y sustituye <code>"PEGA_AQUI_TU_CLIENT_ID"</code> por tu ID entre comillas.
                </li>
              </ul>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                ✓ ¡Listo! Ahora haz clic en «Conectar con Google Drive». Se abrirá la ventana oficial de Google pidiendo permiso solo para su carpeta de datos.
              </p>
            </div>
          </div>

          {/* PASO 3: PUBLICACIÓN GRATUITA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Cómo publicarla gratis en Internet (Netlify o GitHub Pages)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <p><strong>Opción Netlify (la más rápida para no programadores):</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Crea una cuenta gratis en Netlify.com.</li>
                <li>Ejecuta <code>npm run build</code> para generar la carpeta <code>dist</code>.</li>
                <li>Arrastra la carpeta <code>dist</code> directamente a la web de Netlify en «Sites &gt; Drop here». En 3 segundos tendrás tu web online con dirección HTTPS gratuita.</li>
              </ol>
            </div>
          </div>

          {/* PASO 4: INSTALACIÓN EN EL MÓVIL COMO APP (PWA) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>Cómo instalarla como aplicación en tu móvil (Android e iPhone)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> En Android (Chrome)
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Abre la app en Chrome, pulsa el botón <strong>«Instalar App»</strong> arriba en la cabecera, o toca el menú de tres puntos de Chrome y elige <strong>«Instalar aplicación»</strong>. Se colocará el icono de MiOpo AAE en tu pantalla principal.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> En iPhone / iPad (Safari)
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Abre la web en Safari, pulsa el botón central de <strong>Compartir</strong> (cuadrado con flecha hacia arriba), baja un poco y pulsa <strong>«Añadir a pantalla de inicio»</strong>. ¡Funcionará a pantalla completa como una app nativa!
                </p>
              </div>
            </div>
          </div>

          {/* PASO 5: CÓMO USAR CADA SECCIÓN EN TU DÍA A DÍA */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-wider">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                5
              </span>
              <span>Guía rápida: Cómo usar cada sección en tu día a día</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>1. Al empezar el día (Panel de Inicio):</strong> Mira las tareas de hoy, revisa qué temas tienen repasos programados y pulsa «Repasar flashcards» para hacer tus tarjetas SM-2 del día mientras desayunas.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>2. Durante la sesión de estudio (Pomodoro + Anotaciones):</strong> Inicia el cronómetro Pomodoro de 25 min para estudiar sin distracciones. Usa el editor de texto y subraya con la paleta de colores oficial (naranja para plazos, lila para órganos, verde para mayorías).
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>3. Al hacer tests (Tests y Errores):</strong> No dejes pasar ninguna pregunta fallada. Regístrala indicando si fue por despiste, leíste mal o no lo sabías. Con un solo clic conviértela en flashcard para que el algoritmo te la vuelva a preguntar en el momento justo.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>4. En los paseos o descansos (Audios y Lo más preguntable):</strong> Ponte los auriculares para escuchar las canciones mnemotécnicas con velocidad ajustable o activa el «Modo repaso rápido» de Lo más preguntable para repasar plazos y artículos estrella.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong>5. Al terminar un tema (Repaso Espaciado automático):</strong> Marca el tema como «Estudiado». La app generará automáticamente en tu calendario 4 recordatorios (+1, +7, +21 y +45 días) para que nunca se te olvide nada.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition"
          >
            ¡Entendido, a por mi plaza!
          </button>
        </div>
      </div>
    </div>
  );
};
