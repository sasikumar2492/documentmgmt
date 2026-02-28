import React, { useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, FileText, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationData } from '../types';

interface NotificationCenterProps {
  notifications: NotificationData[];
  isOpen: boolean;
  onToggle: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onViewAll?: () => void;
  onNotificationClick?: (notification: NotificationData) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onToggle,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onViewAll,
  onNotificationClick
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'request_submitted':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'template_published':
        return <Upload className="h-5 w-5 text-green-500" />;
      case 'form_approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'form_rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Notification Panel - Popup Style similar to AI Assistant */}
      <div 
        ref={dropdownRef}
        className="fixed top-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 transform transition-all duration-200 ease-out flex flex-col max-h-[600px]"
        style={{ animation: 'fadeInScale 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              Notifications
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAllAsRead();
                }}
                className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 px-3 py-1 h-auto rounded-lg shadow-sm"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1.5 h-auto w-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-2">You'll see updates here when they arrive</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-5 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => onNotificationClick && onNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-slate-900 mb-1`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-slate-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          {notification.fromUser && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">From: {notification.fromUser}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkAsRead(notification.id);
                            }}
                            className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-100 rounded-full"
                            title="Mark as read"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNotification(notification.id);
                          }}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md"
            >
              View all notifications
            </Button>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};