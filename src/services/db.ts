import { AppData, FileItem } from '../types';
import { INITIAL_DATA } from '../data/initialData';

const DB_NAME = 'MiOpoAAEDatabase';
const DB_VERSION = 1;
const STORE_STATE = 'app_state';
const STORE_FILES = 'file_vault';
const STORE_BACKUPS = 'backups';

class LocalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB no está soportado en este entorno.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_STATE)) {
          db.createObjectStore(STORE_STATE);
        }
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          db.createObjectStore(STORE_FILES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_BACKUPS)) {
          db.createObjectStore(STORE_BACKUPS, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // Load app data
  async loadData(): Promise<AppData> {
    try {
      const db = await this.getDB();
      return new Promise<AppData>((resolve) => {
        const tx = db.transaction(STORE_STATE, 'readonly');
        const store = tx.objectStore(STORE_STATE);
        const req = store.get('current_data');

        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result as AppData);
          } else {
            // First time loading: try to seed initial data
            this.saveData(INITIAL_DATA).then(() => resolve(INITIAL_DATA));
          }
        };
        req.onerror = () => {
          console.warn('Error reading from IndexedDB, using initial data', req.error);
          resolve(INITIAL_DATA);
        };
      });
    } catch (e) {
      console.warn('Failed to access IndexedDB, falling back to INITIAL_DATA', e);
      return INITIAL_DATA;
    }
  }

  // Save current app data
  async saveData(data: AppData): Promise<void> {
    try {
      const db = await this.getDB();
      const updatedData = { ...data, lastUpdated: new Date().toISOString() };
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_STATE, 'readwrite');
        const store = tx.objectStore(STORE_STATE);
        const req = store.put(updatedData, 'current_data');
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('Error saving data to IndexedDB:', e);
    }
  }

  // Save automatic backup snapshot
  async createBackupSnapshot(data: AppData, reason: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_BACKUPS, 'readwrite');
        const store = tx.objectStore(STORE_BACKUPS);
        const snapshot = {
          date: new Date().toISOString(),
          reason,
          data,
        };
        const req = store.add(snapshot);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.error('Failed to create backup snapshot:', e);
    }
  }

  // Save binary file blob into the vault
  async saveFileBlob(id: string, file: Blob, metadata: Omit<FileItem, 'dataUrl' | 'id'>): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const req = store.put({ id, file, ...metadata });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Retrieve binary file blob from vault
  async getFileBlob(id: string): Promise<{ file: Blob; [key: string]: any } | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  // Delete binary file from vault
  async deleteFileBlob(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const dbService = new LocalDatabase();

// Utility for exporting data to a downloadable JSON file
export function exportDataAsJSON(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `MiOpo_AAE_Copia_Seguridad_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Utility to export tasks to standard iCalendar (.ics) format
export function exportCalendarToICS(data: AppData): void {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MiOpo AAE//Planificador de Oposición//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Planificador MiOpo AAE',
  ];

  // Add tasks
  data.tasks.forEach((task) => {
    const dateFormatted = task.date.replace(/-/g, '');
    const startTime = task.time ? `${task.time.replace(':', '')}00` : '090000';
    const durationHours = Math.floor(task.durationMinutes / 60);
    const durationMinutes = task.durationMinutes % 60;
    const durationStr = `PT${durationHours}H${durationMinutes}M`;

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:task-${task.id}@miopo-aae.app`);
    icsContent.push(`DTSTAMP:${dateFormatted}T${startTime}Z`);
    icsContent.push(`DTSTART:${dateFormatted}T${startTime}`);
    icsContent.push(`DURATION:${durationStr}`);
    icsContent.push(`SUMMARY:${task.title}`);
    icsContent.push(`DESCRIPTION:Prioridad: ${task.priority}. Tipo: ${task.type}`);
    icsContent.push(`STATUS:${task.status === 'completada' ? 'COMPLETED' : 'CONFIRMED'}`);
    icsContent.push('END:VEVENT');
  });

  // Add exam date if set
  if (data.settings.examDate) {
    const examDateFormatted = data.settings.examDate.replace(/-/g, '');
    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:exam-aae-${examDateFormatted}@miopo-aae.app`);
    icsContent.push(`DTSTAMP:${examDateFormatted}T090000Z`);
    icsContent.push(`DTSTART:${examDateFormatted}T090000`);
    icsContent.push('DURATION:PT3H');
    icsContent.push('SUMMARY:🎯 EXAMEN OFICIAL AUXILIAR ADMINISTRATIVO DEL ESTADO');
    icsContent.push('DESCRIPTION:¡Día D! Tú puedes. Tu plaza te espera.');
    icsContent.push('END:VEVENT');
  }

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MiOpo_AAE_Planificador_${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
