// hooks/useSocket.ts
import * as SocketService from '@/services/UnifiedSocketService';
import useAuthStore from '@/store/authStore';
import { useCallback, useEffect, useState } from 'react';

export const useSocket = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>(SocketService.getOnlineUsers());

  // ==================== CONNECTION MANAGEMENT ====================
  useEffect(() => {
    if (!isLoggedIn) {
      console.log(1)
      SocketService.disconnect();
      setIsConnected(false);
      setOnlineUsers([]);
      return;
    }

    // Connect socket
    SocketService.connect().then(() => {
      console.log(12)
      setIsConnected(SocketService.isConnected());
    });

    // Listen to connection events
    const unsubConnected = SocketService.on('socket:connected', () => {
      setIsConnected(true);
      console.log('🟢 Socket connected hook');
    });

    const unsubDisconnected = SocketService.on('socket:disconnected', () => {
      setIsConnected(false);
      console.log('🔴 Socket disconnected hook');
    });

    // Cleanup
    return () => {
      unsubConnected();
      unsubDisconnected();
    };
  }, [isLoggedIn]);

  // ==================== USER PRESENCE MANAGEMENT ====================
  useEffect(() => {
    if (!isConnected) return;
    console.log(`1`)

    const handleUsersList = (users) => {
      console.log("👥 Initial Online Users:", users);
      // Đảm bảo users là mảng và không trùng lặp
      if (users?.length > 0) {
        setOnlineUsers(users);
      }
    };

    const handleUserOnline = (data: { userId: number }) => {
      console.log('userId 01: ', data.userId)
      setOnlineUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    };

    const handleUserOffline = (data: { userId: number }) => {
      console.log('userId', data.userId)
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    };

    const unsubList = SocketService.on('users:list', handleUsersList);
    const unsubOnline = SocketService.on('user:online', handleUserOnline);
    const unsubOffline = SocketService.on('user:offline', handleUserOffline);

    return () => {
      unsubList();
      unsubOnline();
      unsubOffline();
    };
  }, [isConnected]);

  // ==================== HELPER FUNCTIONS ====================
  const isUserOnline = useCallback((userId) => onlineUsers.includes(userId), [onlineUsers]);

  console.log('onlineUsers socket:', onlineUsers)

  // ==================== RETURN ALL METHODS ====================
  return {
    // Connection status
    isConnected,

    // User presence
    onlineUsers,
    isUserOnline,

    // All SocketService methods
    connect: SocketService.connect,
    disconnect: SocketService.disconnect,
  };
};