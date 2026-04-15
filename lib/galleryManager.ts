const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryImage {
  /** 0-based index into the data rows (row 0 = sheet row 2) */
  rowIndex: number;
  title: string;
  imageUrl: string;
  caption: string;
  alt: string;
  category: string;
  featured: boolean;
  order: number | '';
  linkUrl: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToImage(row: unknown[], rowIndex: number): GalleryImage {
  const r = row as string[];
  return {
    rowIndex,
    title:    r[0] ?? '',
    imageUrl: r[1] ?? '',
    caption:  r[2] ?? '',
    alt:      r[3] ?? '',
    category: r[4] ?? '',
    featured: String(r[5] ?? '').toUpperCase() === 'TRUE',
    order:    r[6] !== undefined && r[6] !== '' ? Number(r[6]) : '',
    linkUrl:  r[7] ?? '',
  };
}

function imageToRow(img: Omit<GalleryImage, 'rowIndex'>): string[] {
  return [
    img.title,
    img.imageUrl,
    img.caption,
    img.alt,
    img.category,
    img.featured ? 'TRUE' : 'FALSE',
    img.order === '' ? '' : String(img.order),
    img.linkUrl,
  ];
}

async function getGallerySheetId(accessToken: string, spreadsheetId: string): Promise<number> {
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Failed to load sheet metadata (${res.status})`);
  const meta = await res.json();
  const sheet = (meta.sheets as Array<{ properties: { title: string; sheetId: number } }>)
    .find((s) => s.properties.title === 'Gallery');
  if (!sheet) throw new Error('Gallery sheet tab not found');
  return sheet.properties.sheetId;
}

// ─── List ──────────────────────────────────────────────────────────────────────

export async function listGalleryImages(
  accessToken: string,
  spreadsheetId: string,
): Promise<{ images: GalleryImage[]; numericSheetId: number }> {
  const [numericSheetId, valRes] = await Promise.all([
    getGallerySheetId(accessToken, spreadsheetId),
    fetch(`${SHEETS_API}/${spreadsheetId}/values/Gallery!A2:H`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
  ]);

  if (!valRes.ok) throw new Error(`Failed to load gallery images (${valRes.status})`);
  const valJson = await valRes.json();
  const rows: unknown[][] = valJson.values ?? [];

  return {
    numericSheetId,
    images: rows
      .map((row, i) => rowToImage(row, i))
      .filter((img) => img.imageUrl !== ''), // skip placeholder rows without URLs
  };
}

// ─── Upload & publish ─────────────────────────────────────────────────────────

export async function uploadAndPublishImage(
  accessToken: string,
  file: File,
): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`);
  }

  // 1. Initiate resumable upload
  const initRes = await fetch(`${UPLOAD_API}?uploadType=resumable`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Upload-Content-Type': file.type || 'image/jpeg',
      'X-Upload-Content-Length': String(file.size),
    },
    body: JSON.stringify({ name: file.name }),
  });
  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err.error?.message ?? `Upload init failed (${initRes.status})`);
  }

  const uploadUrl = initRes.headers.get('Location');
  if (!uploadUrl) throw new Error('No upload session URL returned');

  // 2. Upload bytes
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'image/jpeg' },
    body: file,
  });
  if (!uploadRes.ok) throw new Error(`Upload failed (${uploadRes.status})`);
  const driveFile = await uploadRes.json() as { id: string };

  // 3. Make public
  const permRes = await fetch(`${DRIVE_API}/${driveFile.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });
  if (!permRes.ok) throw new Error(`Failed to make image public (${permRes.status})`);

  // Return the public thumbnail URL (works for all image types)
  return `https://lh3.googleusercontent.com/d/${driveFile.id}`;
}

// ─── Append rows ──────────────────────────────────────────────────────────────

export async function appendGalleryImages(
  accessToken: string,
  spreadsheetId: string,
  images: Omit<GalleryImage, 'rowIndex'>[],
): Promise<void> {
  const values = images.map(imageToRow);
  const res = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Gallery!A:H:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    },
  );
  if (!res.ok) throw new Error(`Failed to append images (${res.status})`);
}

// ─── Delete row ───────────────────────────────────────────────────────────────

export async function deleteGalleryImage(
  accessToken: string,
  spreadsheetId: string,
  numericSheetId: number,
  /** 0-based data row index (not including header) */
  rowIndex: number,
): Promise<void> {
  const sheetRow = rowIndex + 1; // +1 for header row
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId: numericSheetId,
            dimension: 'ROWS',
            startIndex: sheetRow,
            endIndex: sheetRow + 1,
          },
        },
      }],
    }),
  });
  if (!res.ok) throw new Error(`Failed to delete image (${res.status})`);
}
