import React, { useState, useEffect } from 'react';
import { MessageSquare, Headphones } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ChatDrawer } from './ChatDrawer';
import { subscribeToUserChannels } from '../../services/chatService';

interface ChatFloatingButtonProps {
  initialChannelId?: string | null;
  initialTargetUser?: { id: string; name: string; role: 'customer' | 'driver' | 'admin' };
  initialBookingId?: string;
  customButtonClass?: string;
}

export const ChatFloatingButton: React.FC<ChatFloatingButtonProps> = ({
  initialChannelId,
  initialTargetUser,
  initialBookingId,
  customButtonClass,
}) => {
  const { currentUser, role } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const currentUserId = currentUser?.uid || (role === 'admin' ? 'admin' : '');
  const currentUserRole = role || 'customer';

  useEffect(() => {
    if (!currentUserId) return;

    const unsub = subscribeToUserChannels(currentUserId, currentUserRole, (channels) => {
      const total = channels.reduce(
        (acc, c) => acc + (c.unreadCounts?.[currentUserId] || 0),
        0
      );
      setUnreadCount(total);
    });

    return () => unsub();
  }, [currentUserId, currentUserRole]);

  if (!currentUser && role !== 'admin') return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          customButtonClass ||
          'fixed bottom-20 right-4 z-40 bg-[#0D47A1] hover:bg-[#1565C0] text-white p-3.5 rounded-full shadow-2xl border-2 border-white flex items-center justify-center transition-all active:scale-90 hover:scale-105 group'
        }
        title="Open Live Chat & Admin Support"
      >
        <MessageSquare className="w-5 h-5 text-white group-hover:rotate-6 transition-transform" />

        {/* Unread Message Badge Indicator */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Chat Drawer Component */}
      <ChatDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialChannelId={initialChannelId}
        initialTargetUser={initialTargetUser}
        initialBookingId={initialBookingId}
      />
    </>
  );
};
