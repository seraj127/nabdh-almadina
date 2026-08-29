'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface OrderData {
  orderId: string;
  orderNumber: string;
  userId: string;
  total: number;
  [key: string]: unknown;
}

interface OrderStatusData {
  orderId: string;
  status: string;
  note?: string;
  [key: string]: unknown;
}

interface NotificationData {
  id: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  type: string;
  [key: string]: unknown;
}

interface RealtimeSyncOptions {
  userId?: string;
  role?: string;
  onNewOrder?: (data: OrderData) => void;
  onOrderStatusChanged?: (data: OrderStatusData) => void;
  onNotification?: (data: NotificationData) => void;
  onRefreshStats?: () => void;
  onCatalogChanged?: () => void;
}

export function useRealtimeSync(options: RealtimeSyncOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { userId, role, onNewOrder, onOrderStatusChanged, onNotification, onRefreshStats, onCatalogChanged } = options;

  // Store callbacks in refs to avoid reconnection on callback changes
  const callbacksRef = useRef({ onNewOrder, onOrderStatusChanged, onNotification, onRefreshStats, onCatalogChanged });
  useEffect(() => {
    callbacksRef.current = { onNewOrder, onOrderStatusChanged, onNotification, onRefreshStats, onCatalogChanged };
  });

  useEffect(() => {
    // Skip WebSocket connection if no userId (not logged in)
    if (!userId) return;

    // Connect to WebSocket server with conservative retry settings
    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 3, // Reduced from 10 to prevent endless retries
      reconnectionDelay: 5000, // Increased from 2s to 5s to reduce CPU/battery impact
      reconnectionDelayMax: 30000, // Cap at 30s between retries
      timeout: 15000, // Increased timeout
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // The server authenticates from the session cookie. Client-provided
      // userId/role are intentionally not sent as identity claims.
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Stop reconnecting after max attempts to save battery
    socket.on('reconnect_failed', () => {
      socket.disconnect();
      socketRef.current = null;
    });

    // Event handlers — use refs so we always call the latest callback
    socket.on('new-order', (data: OrderData) => {
      callbacksRef.current.onNewOrder?.(data);
    });

    socket.on('order-status-changed', (data: OrderStatusData) => {
      callbacksRef.current.onOrderStatusChanged?.(data);
    });

    socket.on('notification', (data: NotificationData) => {
      callbacksRef.current.onNotification?.(data);
    });

    socket.on('refresh-stats', () => {
      callbacksRef.current.onRefreshStats?.();
    });

    socket.on('catalog-changed', () => {
      callbacksRef.current.onCatalogChanged?.();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId, role]);

  const emitOrderCreated = useCallback((data: { orderId: string; orderNumber: string; userId: string; total: number }) => {
    socketRef.current?.emit('order-created', data);
  }, []);

  const emitOrderUpdated = useCallback((data: { orderId: string; orderNumber: string; userId: string; status: string; note?: string }) => {
    socketRef.current?.emit('order-updated', data);
  }, []);

  const emitNotifyUser = useCallback((data: { userId: string; titleAr: string; titleEn: string; bodyAr: string; bodyEn: string; type: string }) => {
    socketRef.current?.emit('notify-user', data);
  }, []);

  const emitDashboardRefresh = useCallback(() => {
    socketRef.current?.emit('dashboard-refresh');
  }, []);

  return {
    emitOrderCreated,
    emitOrderUpdated,
    emitNotifyUser,
    emitDashboardRefresh,
    isConnected,
  };
}
