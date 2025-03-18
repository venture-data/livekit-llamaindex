'use client';

import { LiveKitRoom, VideoConference, setLogLevel } from '@livekit/components-react';
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
        video={false}
        audio={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
        onMediaDeviceFailure={(e) => {
          console.error(e);
          alert(
            'Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab',
          );
        }}
        style={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)'
        }}>
          <VideoConference />
        </div>
      </LiveKitRoom>
    </div>
  );
};

export default MinimalExample;
