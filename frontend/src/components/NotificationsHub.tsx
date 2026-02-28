import React, { useState } from 'react';
import { Bell, Settings, CheckCircle } from 'lucide-react';
import { NotificationsPage } from './NotificationsPage';
import { NotificationSettings } from './NotificationSettings';
import { NotificationData } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface NotificationsHubProps {
  notifications: NotificationData[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  currentUser: any;
}

export const NotificationsHub: React.FC<NotificationsHubProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState('all');
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your notifications and preferences
            </p>
          </div>
          
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">{unreadCount} Unread</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-white border-b border-slate-200 px-8">
            <TabsList className="bg-transparent h-auto p-0 gap-6">
              <TabsTrigger 
                value="all" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-0 pb-4 pt-4 font-medium text-slate-600 data-[state=active]:text-blue-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>All Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="manage" 
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-blue-600 rounded-none px-0 pb-4 pt-4 font-medium text-slate-600 data-[state=active]:text-blue-600 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Manage Notifications</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="all" className="mt-0 h-full focus-visible:outline-none focus-visible:ring-0">
              <NotificationsPage
                notifications={notifications}
                onMarkAsRead={onMarkAsRead}
                onMarkAllAsRead={onMarkAllAsRead}
                onDeleteNotification={onDeleteNotification}
              />
            </TabsContent>

            <TabsContent value="manage" className="mt-0 h-full focus-visible:outline-none focus-visible:ring-0">
              <NotificationSettings currentUser={currentUser} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
