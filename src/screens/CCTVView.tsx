import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import LivePlayer from '../components/LivePlayer';
import CurrentHourPlayback from '../components/CurrentHourPlayback';
import RecordingsTimeline from '../components/RecordingsTimeline';
import { Button } from '../components/ui/button';
import { Link } from 'react-router';

export default function CCTVView() {
  const [activeTab, setActiveTab] = useState<'live' | 'playback' | 'recordings'>('live');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">CCTV Surveillance System</h1>
            <p className="text-gray-400 mt-1">Parcel Drop Security Camera</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleFullscreen} variant="outline">
              {isFullscreen ? '🗙 Exit Fullscreen' : '⛶ Fullscreen'}
            </Button>
            <Link to="/">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'live'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔴 Live Feed
          </button>
          <button
            onClick={() => setActiveTab('playback')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'playback'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⏮ Current Hour Playback
          </button>
          <button
            onClick={() => setActiveTab('recordings')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'recordings'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📹 Recordings Archive
          </button>
        </div>

        {/* Content */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {activeTab === 'live' && 'Live Camera Feed'}
              {activeTab === 'playback' && 'Current Hour Snapshot Playback'}
              {activeTab === 'recordings' && 'Recorded Videos Archive'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'live' && (
              <div>
                <LivePlayer />
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-semibold mb-2">📡 Live Stream Status</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Status:</span>{' '}
                      <span className="text-green-400">● Active</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Format:</span> HLS (H.264)
                    </div>
                    <div>
                      <span className="text-gray-400">Resolution:</span> 1920x1080
                    </div>
                    <div>
                      <span className="text-gray-400">Recording:</span>{' '}
                      <span className="text-green-400">Enabled (10-min segments)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'playback' && (
              <div>
                <CurrentHourPlayback />
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="font-semibold mb-2">ℹ️ Playback Information</h3>
                  <p className="text-sm text-gray-400">
                    This view shows snapshots captured from the current hour. Use the timeline
                    controls to navigate through the footage. Snapshots are taken every minute and
                    automatically updated.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'recordings' && (
              <div>
                <RecordingsTimeline />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Recordings are stored in 10-minute segments • Automatic retention management enabled</p>
          <p className="mt-1">Server: parcel-records.hyprhost.online</p>
        </div>
      </div>
    </div>
  );
}


