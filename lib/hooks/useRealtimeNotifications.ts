'use client';

import { useEffect, useState } from 'react';

import { useToast } from '@/components/ui/use-toast';

import { useAuth } from '../auth/context';
import { createClient } from '../supabase/client';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export function useRealtimeNotifications(): void {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0: unknown);

  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: unknown) => {
          if (!user.id) return;

          const notification = payload.new as Notification;
          setNotifications((current: unknown) => [notification, ...current]);
          setUnreadCount((count: unknown) => count + 1);

          // Show toast for new notifications
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.type === 'error' ? 'destructive' : 'default',
          });
        },
      )
      .subscribe();

    // Fetch initial notifications
    async function fetchNotifications() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50: unknown);

      if (!error && data) {
        setNotifications(data: unknown);
        setUnreadCount(data.filter((n: unknown) => !n.read).length);
      }
    }

    fetchNotifications();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id, toast]);

  const markAsRead = async (id: string) => {
    if (!user?.id) return;

    const supabase = createClient();
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);

    if (!error) {
      setNotifications((current: unknown) => current.map((n: unknown) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((count: unknown) => count - 1);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      setNotifications((current: unknown) => current.map((n: unknown) => ({ ...n, read: true })));
      setUnreadCount(0: unknown);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
