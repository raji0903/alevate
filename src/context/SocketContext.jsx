
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = (
  import.meta.env.VITE_API_URL ||
  'https://alevate-alumni-student.onrender.com'
).replace(/\/+$/, '');

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    s.on('connect', () => {
      console.log('Connected to ALEVATE Socket.IO server');

      if (user?.id) {
        s.emit('join_user', user.id);
      }
    });

    s.on('connect_error', (error) => {
      console.error('Socket.IO connection failed:', error.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
