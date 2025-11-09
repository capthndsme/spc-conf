export const PICAM_BASE = import.meta.env.VITE_PICAM_BASE ?? "https://parcel-records.hyprhost.online";
export const liveUrl = () => `${PICAM_BASE}/live/live.m3u8`;
export const recordingsUrl = (q = "") => `${PICAM_BASE}/recordings${q}`;
export const videosUrl = (file: string) => `${PICAM_BASE}/videos/${file}`;
export const thumbUrl = (file: string) => `${PICAM_BASE}/recordings/${file}/thumbnail`;
export const snapshotsRoot = () => `${PICAM_BASE}/snapshots/`;