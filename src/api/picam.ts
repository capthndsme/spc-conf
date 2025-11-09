import { recordingsUrl } from "../lib/picam";
import type { Page, Recording } from "../types/picam";

export async function fetchRecordings(
  page = 1, 
  pageSize = 50, 
  params?: { start_after?: string; start_before?: string; }
): Promise<Page<Recording>> {
  const sp = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (params?.start_after) sp.set('start_after', params.start_after);
  if (params?.start_before) sp.set('start_before', params.start_before);
  const res = await fetch(recordingsUrl(`?${sp.toString()}`));
  if (!res.ok) throw new Error(`Recordings fetch failed: ${res.status}`);
  return res.json();
}

export async function deleteRecording(filename: string) {
  const res = await fetch(recordingsUrl(`/${encodeURIComponent(filename)}`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}

export async function renameRecording(filename: string, newName: string) {
  const res = await fetch(recordingsUrl(`/${encodeURIComponent(filename)}/rename`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_name: newName }),
  });
  if (!res.ok) throw new Error('Rename failed');
  return res.json();
}

