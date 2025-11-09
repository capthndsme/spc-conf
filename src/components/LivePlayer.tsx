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