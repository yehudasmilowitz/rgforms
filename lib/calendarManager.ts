const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// Columns: Title, Date, Start Time, End Time, Description, Location, Category, URL, All Day, Color
export interface CalendarEvent {
  title: string;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  description: string;
  location: string;
  category: string;
  url: string;
  allDay: string;    // 'true' | 'false'
  color: string;     // hex
  rowIndex: number;  // 0-based row index within data rows (excludes header)
}

export interface NewCalendarEvent {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  url: string;
  allDay: boolean;
  color: string;
}

export async function listCalendarEvents(
  accessToken: string,
  spreadsheetId: string,
): Promise<{ events: CalendarEvent[]; numericSheetId: number }> {
  // Fetch sheet metadata to get the numeric GID of the 'Events' tab
  const meta = await fetch(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties`, {
    headers: authHeaders(accessToken),
  }).then((r) => r.json()) as {
    sheets: Array<{ properties: { title: string; sheetId: number } }>;
  };

  const eventsTab = meta.sheets.find((s) => s.properties.title === 'Events');
  const numericSheetId = eventsTab?.properties.sheetId ?? 0;

  // Read all data rows
  const values = await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Events!A2:J1000`,
    { headers: authHeaders(accessToken) },
  ).then((r) => r.json()) as { values?: string[][] };

  const rows = values.values ?? [];
  const events: CalendarEvent[] = rows.map((row, i) => ({
    title: row[0] ?? '',
    date: row[1] ?? '',
    startTime: row[2] ?? '',
    endTime: row[3] ?? '',
    description: row[4] ?? '',
    location: row[5] ?? '',
    category: row[6] ?? '',
    url: row[7] ?? '',
    allDay: row[8] ?? 'false',
    color: row[9] ?? '',
    rowIndex: i,
  }));

  return { events, numericSheetId };
}

export async function appendCalendarEvent(
  accessToken: string,
  spreadsheetId: string,
  event: NewCalendarEvent,
): Promise<void> {
  const row = [
    event.title,
    event.date,
    event.startTime,
    event.endTime,
    event.description,
    event.location,
    event.category,
    event.url,
    event.allDay ? 'true' : 'false',
    event.color,
  ];

  await fetch(
    `${SHEETS_API}/${spreadsheetId}/values/Events!A:J:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ values: [row] }),
    },
  );
}

export async function deleteCalendarEvent(
  accessToken: string,
  spreadsheetId: string,
  numericSheetId: number,
  rowIndex: number, // 0-based index within data rows (row 0 = sheet row 2)
): Promise<void> {
  // sheet row = rowIndex + 1 (for header) → startIndex for deleteDimension is 0-based within all rows
  // so: header is row 0, first data row is row 1 → startIndex = rowIndex + 1
  const startIndex = rowIndex + 1;
  await fetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    headers: authHeaders(accessToken),
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: {
            sheetId: numericSheetId,
            dimension: 'ROWS',
            startIndex,
            endIndex: startIndex + 1,
          },
        },
      }],
    }),
  });
}
