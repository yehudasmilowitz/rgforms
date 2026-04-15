import type { AssetFile } from '@/types';

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export { MAX_FILE_SIZE };

export async function uploadAssetFile(
  accessToken: string,
  folderId: string,
  file: File,
): Promise<AssetFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB. For larger files, upload directly to the Drive folder.`);
  }

  // Initiate resumable upload
  const initiateRes = await fetch(`${UPLOAD_API}?uploadType=resumable`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': file.type || 'application/octet-stream',
      'X-Upload-Content-Length': String(file.size),
    },
    body: JSON.stringify({ name: file.name, parents: [folderId] }),
  });
  if (!initiateRes.ok) {
    const err = await initiateRes.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Upload initiation failed (${initiateRes.status})`);
  }

  const uploadUrl = initiateRes.headers.get('Location');
  if (!uploadUrl) throw new Error('No upload session URL returned from Drive API');

  // Upload file bytes
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });
  if (!uploadRes.ok) throw new Error(`Upload failed (${uploadRes.status})`);

  const driveFile = await uploadRes.json() as {
    id: string; name: string; mimeType: string;
    createdTime?: string; modifiedTime?: string;
  };

  const isImage = driveFile.mimeType.startsWith('image/');
  return {
    id: driveFile.id,
    name: driveFile.name,
    mimeType: driveFile.mimeType,
    isImage,
    size: file.size,
    url: isImage
      ? `https://lh3.googleusercontent.com/d/${driveFile.id}`
      : `https://drive.google.com/uc?export=download&id=${driveFile.id}`,
    driveUrl: `https://drive.google.com/file/d/${driveFile.id}/view`,
    createdAt: driveFile.createdTime ?? new Date().toISOString(),
    updatedAt: driveFile.modifiedTime ?? new Date().toISOString(),
  };
}

export async function deleteAssetFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`${DRIVE_API}/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 403 || res.status === 404) {
    if (res.status === 403) {
      throw new Error('This file was added directly to Drive and can only be deleted from there.');
    }
    return; // 404 is fine
  }
  if (!res.ok && res.status !== 204) {
    throw new Error(`Delete failed (${res.status})`);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
