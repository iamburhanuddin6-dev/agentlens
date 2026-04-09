import { useState, useEffect } from 'react';

export function useEventStream(token) {
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const eventSource = new EventSource(`/api/stream?token=${token}`);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setEvents((prevEvents) => [data, ...prevEvents]);
    };

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  return { events, setEvents, isConnected };
}
