/**
 * ============================================================================
 * CONFIGURACIÓN DE GOOGLE DRIVE OAUTH 2.0 (CLIENT-SIDE)
 * ============================================================================
 * Pega aquí tu ID de Cliente OAuth de Google Cloud (terminado en .apps.googleusercontent.com)
 * Si lo dejas vacío, la aplicación funcionará al 100% en modo local (IndexedDB)
 * y también puedes introducirlo más adelante desde la sección de Ajustes en la app.
 */
export const GOOGLE_CLIENT_ID: string = "PEGA_AQUI_TU_CLIENT_ID";

import { AppData } from '../types';
import { dbService } from './db';

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const FOLDER_NAME = 'MiOpo AAE';
const DATA_FILE_NAME = 'datos.json';

// Global types for Google Identity Services & GAPI
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
    gapi?: any;
  }
}

class GoogleDriveSyncService {
  private accessToken: string | null = null;
  private tokenClient: any = null;
  private appFolderId: string | null = null;
  private isSyncing = false;
  private syncTimeout: any = null;

  // Resolves the effective Google Client ID (from constant or saved in app settings)
  getEffectiveClientId(customId?: string): string {
    if (customId && customId.trim() && customId !== 'PEGA_AQUI_TU_CLIENT_ID') {
      return customId.trim();
    }
    if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID.trim() && GOOGLE_CLIENT_ID !== 'PEGA_AQUI_TU_CLIENT_ID') {
      return GOOGLE_CLIENT_ID.trim();
    }
    return '';
  }

  isConfigured(customId?: string): boolean {
    return !!this.getEffectiveClientId(customId);
  }

  // Connect & authenticate using Google Identity Services (GIS)
  async authenticate(customId?: string): Promise<string> {
    const clientId = this.getEffectiveClientId(customId);
    if (!clientId) {
      throw new Error('No se ha configurado el ID de Cliente de Google.');
    }

    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      throw new Error('El script de Google Identity Services aún no ha cargado en el navegador.');
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: DRIVE_FILE_SCOPE,
          callback: (response) => {
            if (response.error) {
              console.error('GIS Error:', response.error);
              reject(new Error(`Error de autenticación Google: ${response.error}`));
              return;
            }
            if (response.access_token) {
              this.accessToken = response.access_token;
              resolve(response.access_token);
            } else {
              reject(new Error('No se obtuvo token de acceso.'));
            }
          },
        });

        // Request token (triggers Google popup)
        this.tokenClient.requestAccessToken({ prompt: '' });
      } catch (err: any) {
        reject(err);
      }
    });
  }

  disconnect() {
    this.accessToken = null;
    this.appFolderId = null;
  }

  isConnected(): boolean {
    return !!this.accessToken;
  }

  // Find or create "MiOpo AAE" root folder in user's Drive
  async getOrCreateAppFolder(): Promise<string> {
    if (this.appFolderId) return this.appFolderId;
    if (!this.accessToken) throw new Error('No estás conectado a Google Drive.');

    // Search for existing folder
    const query = encodeURIComponent(
      `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`
    );
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name)`;

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Error al buscar carpeta en Drive: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      this.appFolderId = data.files[0].id;
      return this.appFolderId!;
    }

    // Create folder if not found
    const createUrl = 'https://www.googleapis.com/drive/v3/files';
    const folderMetadata = {
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(folderMetadata),
    });

    if (!createRes.ok) {
      throw new Error(`Error al crear carpeta MiOpo AAE en Drive: ${createRes.statusText}`);
    }

    const newFolder = await createRes.json();
    this.appFolderId = newFolder.id;
    return this.appFolderId!;
  }

  // Find existing datos.json in "MiOpo AAE" folder
  async findDataFileId(folderId: string): Promise<string | null> {
    const query = encodeURIComponent(
      `'${folderId}' in parents and name = '${DATA_FILE_NAME}' and trashed = false`
    );
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id, name, modifiedTime)`;

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }

  // Upload or update datos.json
  async uploadDatosJson(localData: AppData): Promise<void> {
    const folderId = await this.getOrCreateAppFolder();
    const existingFileId = await this.findDataFileId(folderId);

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const metadata = {
      name: DATA_FILE_NAME,
      mimeType: 'application/json',
      ...(!existingFileId ? { parents: [folderId] } : {}),
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(localData) +
      closeDelim;

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFileId) {
      url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`;
      method = 'PATCH';
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      throw new Error(`Fallo al guardar datos.json en Drive: ${res.statusText}`);
    }
  }

  // Download remote datos.json
  async downloadDatosJson(folderId: string): Promise<AppData | null> {
    const fileId = await this.findDataFileId(folderId);
    if (!fileId) return null;

    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Error al descargar datos.json: ${res.statusText}`);
    }

    return await res.json();
  }

  // Full Two-Way Sync with conflict resolution (newest timestamp wins + auto-backup)
  async sync(
    localData: AppData,
    onStatusChange: (status: AppData['settings']['driveSyncStatus'], timestamp?: string) => void
  ): Promise<AppData> {
    if (!this.accessToken) {
      onStatusChange('desconectado');
      return localData;
    }

    if (this.isSyncing) return localData;
    this.isSyncing = true;
    onStatusChange('pendiente');

    try {
      const folderId = await this.getOrCreateAppFolder();
      const remoteData = await this.downloadDatosJson(folderId);

      let finalData = localData;

      if (!remoteData) {
        // No remote data yet: upload local state directly
        await this.uploadDatosJson(localData);
      } else {
        // Compare timestamps
        const localTime = new Date(localData.lastUpdated || 0).getTime();
        const remoteTime = new Date(remoteData.lastUpdated || 0).getTime();

        if (remoteTime > localTime) {
          // Remote is newer: take safety backup of local state first, then accept remote
          await dbService.createBackupSnapshot(localData, 'Pre-sync automatic backup (Drive was newer)');
          finalData = remoteData;
          await dbService.saveData(finalData);
        } else {
          // Local is newer or equal: push to Drive
          await this.uploadDatosJson(localData);
        }
      }

      const syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      onStatusChange('sincronizado', syncTime);
      this.isSyncing = false;
      return finalData;
    } catch (err) {
      console.error('Sync failed:', err);
      onStatusChange('error');
      this.isSyncing = false;
      throw err;
    }
  }

  // Trigger debounced sync whenever state changes
  debounceSync(
    localData: AppData,
    onStatusChange: (status: AppData['settings']['driveSyncStatus'], timestamp?: string) => void
  ) {
    if (!this.accessToken) return;
    onStatusChange('pendiente');
    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.sync(localData, onStatusChange).catch(() => {});
    }, 3000);
  }
}

export const googleDriveService = new GoogleDriveSyncService();
