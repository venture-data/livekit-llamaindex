'use client';

import { LiveKitRoom, VideoConference, setLogLevel } from '@livekit/components-react';
import type { NextPage } from 'next';
import { generateRandomUserId } from '../lib/helper';
import { useState, useEffect, useMemo } from 'react';

const MinimalExample: NextPage = () => {
  const [token, setToken] = useState<string | null>(null); // State for storing the token

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

  // Fetch the token using useEffect
  useEffect(() => {
    const fetchToken = async () => {
      const response = await fetch('http://localhost:3000/api/token'); // Adjust the endpoint if needed
      const data = await response.json();
      setToken(data.accessToken); // Set the token in state
    };

    fetchToken();
  }, []); // Empty dependency array ensures it runs once on mount

  if (!token) {
    return <div>Loading...</div>; // Optional loading state while token is being fetched
  }

  return (
    <div data-lk-theme="default" style={{ height: '100vh' }}>
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
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default MinimalExample;
