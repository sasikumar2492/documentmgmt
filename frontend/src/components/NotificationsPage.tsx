import React, { useState } from 'react';
import { Bell, CheckCircle, AlertCircle, FileText, Upload, Trash2, Check, Filter, Search } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationData } from '../types';
import { Input } from './ui/input';

interface NotificationsPageProps {
  notifications: NotificationData[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getNotificationIcon = (type: NotificationData['type']) => {
    switch (type) {
      case 'request_submitted':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'template_published':
        return <Upload className="h-6 w-6 text-green-500" />;
      case 'form_approved':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'form_rejected':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Bell className="h-6 w-6 text-slate-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  };

  const formatFullDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filterType === 'all' 
      ? true 
      : filterType === 'unread' 
        ? !notification.isRead 
        : notification.isRead;
    
    const matchesSearch = searchQuery === '' 
      ? true 
      : notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Filter and Search Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <Button
              onClick={onMarkAllAsRead}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
            >
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilterType('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterType === 'unread'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterType('read')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterType === 'read'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Read ({notifications.filter(n => n.isRead).length})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-slate-900 mb-2">No notifications found</h3>
            <p className="text-sm text-slate-500">
              {searchQuery ? 'Try adjusting your search query' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-slate-900 mb-1 ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          <span>•</span>
                          <span>{formatFullDate(notification.timestamp)}</span>
                          {notification.fromUser && (
                            <>
                              <span>•</span>
                              <span>From: {notification.fromUser}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="text-blue-500 hover:bg-blue-50"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNotification(notification.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};