import React, { useState, useEffect, useRef } from 'react';
import { fetchRecordings, deleteRecording, renameRecording } from '../api/picam';
import type { Recording } from '../types/picam';
import { videosUrl, thumbUrl } from '../lib/picam';
import { Button } from './ui/button';
import { toast } from 'sonner';

function groupByDate(items: Recording[]) {
  return items.reduce((acc, r) => {
    const d = new Date(r.started_at);
    const key = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    (acc[key] ||= []).push(r);
    return acc;
  }, {} as Record<string, Recording[]>);
}

export default function RecordingsTimeline() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Recording[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRecordings(page, 50)
      .then((p) => {
        if (cancelled) return;
        setItems((prev) => [...prev, ...p.items]);
        setHasNext(p.has_next);
        setLoading(false);
      })
      .catch((err) => {
        toast.error('Failed to load recordings');
        console.error(err);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Infinite scroll
  useEffect(() => {
    if (!hasNext) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) setPage((p) => p + 1);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNext]);

  const handleDelete = async (filename: string) => {
    if (!confirm('Delete this recording?')) return;
    try {
      await deleteRecording(filename);
      setItems((prev) => prev.filter((item) => item.filename !== filename));
      toast.success('Recording deleted');
    } catch (err) {
      toast.error('Failed to delete recording');
      console.error(err);
    }
  };

  const handleRename = async (filename: string) => {
    const newName = prompt('New file name (must end with .mp4)', `renamed-${Date.now()}.mp4`);
    if (!newName) return;
    if (!newName.endsWith('.mp4')) {
      toast.error('Filename must end with .mp4');
      return;
    }
    try {
      await renameRecording(filename, newName);
      setItems((prev) =>
        prev.map((item) =>
          item.filename === filename ? { ...item, filename: newName } : item
        )
      );
      toast.success('Recording renamed');
    } catch (err) {
      toast.error('Failed to rename recording');
      console.error(err);
    }
  };

  const groups = groupByDate(items);

  return (
    <div className="space-y-6">
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕ Close
            </button>
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          </div>
        </div>
      )}

      {Object.entries(groups).map(([date, recs]) => (
        <section key={date}>
          <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2 border-b">
            {date}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recs.map((r) => (
              <article
                key={r.filename}
                className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setSelectedVideo(videosUrl(r.filename))}
                >
                  <img
                    src={thumbUrl(r.filename)}
                    alt={r.filename}
                    className="w-full h-40 object-cover bg-gray-900"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="p-3">
                    <div className="text-sm font-semibold">
                      {new Date(r.started_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {(r.size_bytes / 1_000_000).toFixed(1)} MB • {((r.duration_sec / 60) | 0)} min
                    </div>
                    <div className="text-xs mt-1 truncate text-gray-400">{r.filename}</div>
                  </div>
                </div>
                <div className="px-3 pb-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRename(r.filename)}
                    className="flex-1"
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(r.filename)}
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <div ref={sentinelRef} style={{ height: 1 }} />
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading...</p>
        </div>
      )}
      {!hasNext && !loading && items.length > 0 && (
        <p className="text-center text-gray-500 py-4">End of recordings</p>
      )}
      {!loading && items.length === 0 && (
        <p className="text-center text-gray-500 py-8">No recordings found</p>
      )}
    </div>
  );
}


