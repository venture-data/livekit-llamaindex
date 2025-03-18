'use client';

import "@livekit/components-styles";
import { LiveKitRoom, RoomAudioRenderer, VideoConference, setLogLevel, useVoiceAssistant, BarVisualizer, VoiceAssistantControlBar } from '@livekit/components-react';
import type { NextPage } from 'next';
import { generateRandomUserId } from '../lib/helper';
import { useState, useEffect, useMemo } from 'react';

const MinimalExample: NextPage = () => {
  const [token, setToken] = useState<string | null>(null);

  const params = typeof window !== 'undefined' ? new URLSearchParams(location.search) : null;
  const roomName = params?.get('room') ?? 'test-room';
  setLogLevel('info', { liveKitClientLogLevel: 'warn' });

  const tokenOptions = useMemo(() => {
    const userId = params?.get('user') ?? generateRandomUserId();
    return {
      userInfo: {
        identity: userId,
        name: userId,
      },
    };
  }, []);

  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch('http://localhost:3000/api/token');
      const data = await response.json();
      setToken(data.accessToken);
    };

    fetchToken();
  }, []);

  if (!token) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 300,
          letterSpacing: '0.05em',
          animation: 'pulse 1.5s ease-in-out infinite',
          opacity: 0.8
        }}>
          Connecting...
        </div>
      </div>
    );
  }

  return (
    <div data-lk-theme="default" style={{ 
      height: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 100%)',
      color: '#ffffff'
    }}>
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
      connect={true}
      audio={true}
    >
      <SimpleVoiceAssistant />
      <VoiceAssistantControlBar />
      <RoomAudioRenderer />
    </LiveKitRoom>
    </div>
  );
};

function SimpleVoiceAssistant() {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <div className="h-80">
      <BarVisualizer state={state} barCount={5} trackRef={audioTrack} style={{}} />
      <p className="text-center">{state}</p>
    </div>
  );
}

export default MinimalExample;
