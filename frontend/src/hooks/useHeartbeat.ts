import { useEffect } from 'react';
import { forumApi } from '../api';

export const useHeartbeat = () => {
  useEffect(() => {
    const currentUser = localStorage.getItem('user');
    if (!currentUser) return;

    const sendHeartbeat = async () => {
      try {
        await forumApi.heartbeat();
      } catch (err) {
        // Silently fail, user might be logged out
      }
    };

    sendHeartbeat(); // Send immediately on mount

    // Send every 10 seconds
    const heartbeatInterval = setInterval(sendHeartbeat, 10000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, []);
};
