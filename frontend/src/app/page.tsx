'use client';

import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar
} from '@livekit/components-react';
import type { NextPage } from 'next';
import { generateRandomUserId } from '../lib/helper';
import { useState, useEffect, useMemo } from 'react';
import "@livekit/components-styles";

const VoiceAgentPage: NextPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const params = typeof window !== 'undefined' ? new URLSearchParams(location.search) : null;
  const roomName = params?.get('room') ?? 'voice-agent-room';

  const tokenOptions = useMemo(() => {
    const userId = params?.get('user') ?? generateRandomUserId();
    return {
      userInfo: { identity: userId, name: userId },
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
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          fontSize: '1.25rem',
          fontWeight: 300,
          letterSpacing: '0.1em',
          animation: 'pulse 1.5s infinite',
          opacity: 0.9
        }}>
          Initializing Voice Agent...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a2e 100%)',
      color: '#ffffff'
    }}>
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
        connect={true}
        audio={true}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}
      >
        <VoiceAssistantVisualizer />
        <VoiceAssistantControlBar style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1rem',
          backdropFilter: 'blur(8px)'
        }} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
};

function VoiceAssistantVisualizer() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      borderRadius: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        height: '40vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '2rem'
      }}>
        <BarVisualizer
          state={state}
          barCount={7}
          trackRef={audioTrack}
          style={{
            height: '150px',
            '--lk-bar-color': 'rgba(255, 255, 255, 0.8)',
            '--lk-bar-width': '12px',
            gap: '1rem',
          } as React.CSSProperties}
        />
        <div style={{
          textAlign: 'center',
          fontSize: '1.2rem',
          fontWeight: 300,
          letterSpacing: '0.05em',
          color: 'rgba(255, 255, 255, 0.9)',
          textTransform: 'uppercase',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {state.replace(/([A-Z])/g, ' $1').trim()}
        </div>
      </div>
    </div>
  );
}

export default VoiceAgentPage;
