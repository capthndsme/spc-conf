# Pi Cam Frontend Integration Guide

A practical, copy‑pasteable guide for wiring your React app to the Python camera server.

> Server defaults
>
> * Livestream: `http://<PI_IP>:8000/live/live.m3u8`
> * Recordings API base: `http://<PI_IP>:8000`
> * Recordings path: `/media/parcel/5853-D58C/videos` (served at `/videos`)
> * Snapshots path: `/media/parcel/5853-D58C/videos/snapshots` (served at `/snapshots`)

# By the way, we could hardcode the PI_IP to parcel-records.hyprhost.online (no port needed)

---

## 0) Install client deps (recommended)

```bash
npm i hls.js        # HLS playback on non-Safari browsers
```

(If you use shadcn/ui, lucide, etc., add them as you like; not required.)

Create an env for the server base URL:

```env
# .env.local
VITE_PICAM_BASE=http://<PI_IP>:8000
```

Small helper to resolve URLs:

```ts
// src/lib/picam.ts
export const PICAM_BASE = import.meta.env.VITE_PICAM_BASE ?? "";
export const liveUrl = () => `${PICAM_BASE}/live/live.m3u8`;
export const recordingsUrl = (q = "") => `${PICAM_BASE}/recordings${q}`;
export const videosUrl = (file: string) => `${PICAM_BASE}/videos/${file}`;
export const thumbUrl = (file: string) => `${PICAM_BASE}/recordings/${file}/thumbnail`;
export const snapshotsRoot = () => `${PICAM_BASE}/snapshots/`;
```

---

## 1) Livestream player component

```tsx
// src/components/LivePlayer.tsx
import React from "react";
import Hls from "hls.js";
import { liveUrl } from "../lib/picam";

export default function LivePlayer() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const url = liveUrl();
    const video = videoRef.current!;
    if (!video) return;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari
      video.src = url;
      video.play().catch(() => {});
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 10,
        liveBackBufferLength: 30,
        lowLatencyMode: false,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
      return () => hls.destroy();
    }
  }, []);

  return (
    <div style={{ aspectRatio: '16 / 9', background: '#000', borderRadius: 12, overflow: 'hidden' }}>
      <video ref={videoRef} controls playsInline style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
```

Usage:

```tsx
// src/pages/Live.tsx
import LivePlayer from "../components/LivePlayer";

export default function LivePage() {
  return (
    <div className="container">
      <h1>Live</h1>
      <LivePlayer />
    </div>
  );
}
```

---

## 2) Types & API helpers

```ts
// src/types/picam.ts
export type Recording = {
  filename: string;
  path: string;
  url: string;          // "/videos/<file>.mp4"
  size_bytes: number;
  started_at: string;   // ISO8601
  duration_sec: number; // usually 600
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
};
```

```ts
// src/api/picam.ts
import { recordingsUrl } from "../lib/picam";
import type { Page, Recording } from "../types/picam";

export async function fetchRecordings(page = 1, pageSize = 50, params?: { start_after?: string; start_before?: string; }): Promise<Page<Recording>> {
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
```

---

## 3) Timeline UI (group by day, infinite scroll)

```tsx
// src/components/Timeline.tsx
import React from 'react';
import { fetchRecordings } from '../api/picam';
import type { Recording } from '../types/picam';
import { videosUrl, thumbUrl } from '../lib/picam';

function groupByDate(items: Recording[]) {
  return items.reduce((acc, r) => {
    const d = new Date(r.started_at);
    const key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    (acc[key] ||= []).push(r);
    return acc;
  }, {} as Record<string, Recording[]>);
}

export default function Timeline() {
  const [page, setPage] = React.useState(1);
  const [items, setItems] = React.useState<Recording[]>([]);
  const [hasNext, setHasNext] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRecordings(page, 50).then(p => {
      if (cancelled) return;
      setItems(prev => [...prev, ...p.items]);
      setHasNext(p.has_next);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { cancelled = true; };
  }, [page]);

  // Infinite scroll
  React.useEffect(() => {
    if (!hasNext) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) setPage(p => p + 1);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext]);

  const groups = groupByDate(items);

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([date, recs]) => (
        <section key={date}>
          <h3 className="font-semibold mb-3">{date}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recs.map(r => (
              <article key={r.filename} className="border rounded-xl overflow-hidden">
                <a href={videosUrl(r.filename)} className="block">
                  <img
                    src={thumbUrl(r.filename)}
                    alt={r.filename}
                    style={{ width: '100%', height: 160, objectFit: 'cover', background: '#111' }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="p-3">
                    <div className="text-sm opacity-70">
                      {new Date(r.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs mt-1">
                      {(r.size_bytes / 1_000_000).toFixed(1)} MB • {(r.duration_sec / 60) | 0} min
                    </div>
                    <div className="text-xs mt-1 truncate">{r.filename}</div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}

      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && <p>Loading…</p>}
      {!hasNext && !loading && items.length > 0 && <p className="opacity-60">End of list</p>}
    </div>
  );
}
```

Add to a page:

```tsx
// src/pages/Recordings.tsx
import Timeline from "../components/Timeline";

export default function RecordingsPage(){
  return (
    <div className="container">
      <h1>Recordings</h1>
      <Timeline />
    </div>
  );
}
```

---

## 4) CRUD actions (rename, delete)

Add quick UI handlers where you render each recording card. Example buttons:

```tsx
<button onClick={async (e) => {
  e.preventDefault();
  const newName = prompt("New file name (must end with .mp4)", `renamed-${Date.now()}.mp4`);
  if (!newName) return;
  try {
    await renameRecording(r.filename, newName);
    // optimistically update UI or refetch current page
  } catch (err) {
    alert("Rename failed");
  }
}}>Rename</button>

<button onClick={async (e) => {
  e.preventDefault();
  if (!confirm("Delete this recording?")) return;
  try {
    await deleteRecording(r.filename);
    // remove from UI state or refetch
  } catch (err) {
    alert("Delete failed");
  }
}}>Delete</button>
```

---

## 5) Error handling tips

* The server returns sensible 4xx/5xx codes. For fetch, always check `res.ok`.
* Thumbnails may not exist (404). Hide `<img>` on `onError`.
* In livestream, HLS can take a few seconds to buffer; consider a skeleton loader.

---

## 6) CORS & hosting

* Server enables permissive CORS (`*`). If you lock it down, add your frontend origin.
* In dev, use Vite proxy to avoid CORS altogether:

```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/live': 'http://<PI_IP>:8000',
      '/recordings': 'http://<PI_IP>:8000',
      '/videos': 'http://<PI_IP>:8000',
      '/snapshots': 'http://<PI_IP>:8000',
    }
  }
});
```

---

## 7) Useful backend endpoints (recap)

```
GET  /health
GET  /live/live.m3u8            -> HLS livestream
GET  /recordings?page&pagesize   -> paginated list (newest first)
GET  /recordings/cursor?after&limit
PUT  /recordings/{file}/rename   { new_name }
DEL  /recordings/{file}
GET  /recordings/{file}/thumbnail-> closest JPEG near start
Static: /videos/<file>.mp4, /snapshots/<file>.jpg
```

---

## 8) QA checklist

* [ ] Live page plays in Chrome, Firefox, Safari (Safari can use native HLS).
* [ ] Timeline shows newest recordings, infinite scroll loads more.
* [ ] Thumbnail loads; missing thumbnails don’t break layout.
* [ ] Rename/Delete mutate the list correctly.
* [ ] Network on slow LAN still feels okay (consider shrinking `page_size`).

---

## 9) Bonus ideas (optional)

* Add a small “clip” action that POSTs a start/end to the backend to export a subclip from a 10‑min file via `ffmpeg -ss/-to`.
* Add tags/notes per recording (persist a small JSON next to each mp4).
* Add a calendar view (group by day in a monthly grid) and render chips per 10‑min block.
* Surface snapshot URLs inside the `/recordings` response for one-shot thumbnails (backend change).

---

**You’re done.** Drop in the Live player and the Timeline component, set `VITE_PICAM_BASE`, ship it. 🚢
