# Snapshot System Improvements

## Issues Fixed

### 1. **Blank Snapshots**
- **Problem**: Snapshots were potentially blank due to timing/encoding issues
- **Solution**: 
  - Improved quality setting from `-q:v 5` to `-q:v 3` (better quality)
  - Added explicit scaling `scale=1280:720` to ensure proper resolution
  - Changed from every 5 seconds to every 60 seconds (cleaner, more reliable)

### 2. **Filename Mismatch**
- **Problem**: Frontend looked for `2025-10-24_1458.jpg` but recorder created `2025-10-24_14-58-00.jpg`
- **Solution**: Simplified snapshot naming to `%Y-%m-%d_%H%M.jpg` (e.g., `2025-10-24_1458.jpg`)
  - Matches expected format
  - One snapshot per minute (cleaner)
  - Easier to reference and debug

### 3. **Current Minute Unavailable**
- **Problem**: At 14:57, the 14:57 snapshot doesn't exist yet (still being captured)
- **Solution**: 
  - Exclude the current minute from playback
  - Show snapshots from 1-60 minutes ago
  - Auto-refresh every 30 seconds to pull in new snapshots
  - Display helpful error placeholder when snapshot is missing

## Changes Summary

### `recorder.py`
```python
# Changed snapshot interval
SNAPSHOT_EVERY_SEC = 60  # Was: 5

# Improved snapshot quality and format
"-vf", f"fps=1/{SNAPSHOT_EVERY_SEC},scale=1280:720",
"-q:v", "3",  # Was: 5
str(SNAPSHOT_DIR / "%Y-%m-%d_%H%M.jpg"),  # Was: %Y-%m-%d_%H-%M-%S.jpg
```

### `CurrentHourPlayback.tsx`
- Fixed timestamp generation to match new format (`YYYY-MM-DD_HHMM`)
- Calculate snapshots for last 60 minutes, excluding current minute
- Better error handling with placeholder when images don't load
- Refresh snapshots every 30 seconds
- Improved timestamp display formatting

## New Snapshot Format

**Old**: `2025-10-24_14-58-23.jpg` (every 5 seconds)
**New**: `2025-10-24_1458.jpg` (every minute)

## Benefits

1. **Reliability**: One snapshot per minute is more reliable than every 5 seconds
2. **Storage**: 12x less snapshots = less storage used
3. **Performance**: Faster file scanning and loading
4. **Clarity**: Easier to understand and debug
5. **Accuracy**: No confusion about "which second" a snapshot represents

## After Deploying

1. Restart the recorder service: `pm2 restart recorder` or `sudo systemctl restart recorder`
2. Old snapshots will remain but won't interfere
3. New snapshots will use the new format
4. Thumbnail endpoint supports both old and new formats (backward compatible)

## Testing

After restart, verify:
1. Check `/media/parcel/5853-D58C/videos/snapshots/` for new files
2. Snapshots should appear as `YYYY-MM-DD_HHMM.jpg`
3. Files should be created every minute
4. Images should not be blank
5. Frontend playback should work 1-2 minutes after starting


