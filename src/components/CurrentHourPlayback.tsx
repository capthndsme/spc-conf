import React, { useState, useEffect } from 'react';
import { snapshotsRoot } from '../lib/picam';
import { Button } from './ui/button';

export default function CurrentHourPlayback() {
  const [snapshots, setSnapshots] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms per frame

  useEffect(() => {
    // Generate snapshot URLs for the current hour
    const generateSnapshots = () => {
      const now = new Date();
      const currentMinute = now.getMinutes();
      
      const snaps: string[] = [];
      
      // Generate snapshots for the last 60 minutes, excluding the current minute
      // (current minute snapshot might not be written yet)
      for (let minutesAgo = 60; minutesAgo >= 1; minutesAgo--) {
        const snapshotTime = new Date(now.getTime() - minutesAgo * 60 * 1000);
        const year = snapshotTime.getFullYear();
        const month = (snapshotTime.getMonth() + 1).toString().padStart(2, '0');
        const day = snapshotTime.getDate().toString().padStart(2, '0');
        const hour = snapshotTime.getHours().toString().padStart(2, '0');
        const minute = snapshotTime.getMinutes().toString().padStart(2, '0');
        
        // Format: YYYY-MM-DD_HHMM.jpg (matches recorder.py format)
        const timestamp = `${year}-${month}-${day}_${hour}${minute}`;
        snaps.push(`${snapshotsRoot()}${timestamp}.jpg`);
      }
      
      setSnapshots(snaps);
      if (snaps.length > 0) {
        setCurrentIndex(snaps.length - 1); // Start with the most recent
      }
    };

    generateSnapshots();
    // Refresh snapshots every 30 seconds to get new ones
    const interval = setInterval(generateSnapshots, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= snapshots.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, snapshots.length, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentIndex >= snapshots.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  if (snapshots.length === 0) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No snapshots available for the last hour</p>
      </div>
    );
  }

  const currentSnapshot = snapshots[currentIndex];
  const filenameWithoutExt = currentSnapshot.split('/').pop()?.replace('.jpg', '') || '';
  
  // Parse the timestamp to display it nicely (format: YYYY-MM-DD_HHMM)
  const formatTimestamp = (ts: string) => {
    try {
      const match = ts.match(/(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})/);
      if (match) {
        const [, year, month, day, hour, minute] = match;
        return `${year}-${month}-${day} ${hour}:${minute}`;
      }
      return ts;
    } catch {
      return ts;
    }
  };
  
  const timestamp = formatTimestamp(filenameWithoutExt);

  return (
    <div className="w-full space-y-4">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <img
          key={currentSnapshot}
          src={currentSnapshot}
          alt={`Snapshot ${timestamp}`}
          className="w-full h-full object-contain"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            // Show a placeholder when image fails to load
            img.style.display = 'none';
            const parent = img.parentElement;
            if (parent && !parent.querySelector('.error-placeholder')) {
              const errorDiv = document.createElement('div');
              errorDiv.className = 'error-placeholder absolute inset-0 flex items-center justify-center text-gray-500';
              errorDiv.textContent = '📷 Snapshot not available';
              parent.appendChild(errorDiv);
            }
          }}
          onLoad={(e) => {
            // Remove error placeholder if image loads successfully
            const parent = e.currentTarget.parentElement;
            const placeholder = parent?.querySelector('.error-placeholder');
            if (placeholder) {
              placeholder.remove();
            }
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-sm font-mono">{timestamp}</p>
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max={snapshots.length - 1}
          value={currentIndex}
          onChange={(e) => handleSeek(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              onClick={() => handleSeek(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              size="sm"
              variant="outline"
            >
              ← Prev
            </Button>
            <Button onClick={handlePlayPause} size="sm">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </Button>
            <Button
              onClick={() => handleSeek(Math.min(snapshots.length - 1, currentIndex + 1))}
              disabled={currentIndex === snapshots.length - 1}
              size="sm"
              variant="outline"
            >
              Next →
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm">Speed:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseInt(e.target.value))}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              <option value="1000">Slow (1s)</option>
              <option value="500">Normal (0.5s)</option>
              <option value="250">Fast (0.25s)</option>
              <option value="100">Very Fast (0.1s)</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500 text-center">
          <p>Snapshot {currentIndex + 1} of {snapshots.length}</p>
          <p className="text-xs mt-1">
            Showing last 60 minutes (excluding current minute) • Updates every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

