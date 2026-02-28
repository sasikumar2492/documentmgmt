import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { LogOut, User, Search, Bell, Share2, Download, Settings, Sparkles, Menu, MessageCircle, Zap, Brain, ChevronDown, Building2 } from 'lucide-react';
import logo from 'figma:asset/959a9d3635cfe8c94a3f28db7f3ab3925aae9843.png';
import { NotificationCenter } from './NotificationCenter';
import { AIAssistant } from './AIAssistant';
import { ChatPanel } from './ChatPanel';
import { NotificationData, ViewType, UserRole } from '../types';
import { Breadcrumbs } from './Breadcrumbs';

interface LoginHeaderProps {
  onSignOut?: () => void;
  notifications?: NotificationData[];
  isNotificationOpen?: boolean;
  onNotificationToggle?: () => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (notificationId: string) => void;
  currentView?: ViewType;
  currentPage?: number;
  currentDocumentId?: string | null;
  onNavigate?: (view: ViewType) => void;
  onViewForm?: (reportId: string) => void;
  isChatOpen?: boolean;
  onChatToggle?: () => void;
  isSidebarCollapsed?: boolean;
  userRole?: UserRole;
  username?: string;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({ 
  onSignOut, 
  notifications = [],
  isNotificationOpen = false,
  onNotificationToggle,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  currentView = 'dashboard',
  currentPage,
  currentDocumentId,
  onNavigate,
  onViewForm,
  isChatOpen = false,
  onChatToggle,
  isSidebarCollapsed = false,
  userRole = 'admin',
  username = 'User'
}) => {
  const [localIsChatOpen, setLocalIsChatOpen] = useState(isChatOpen);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Filter notifications based on user role - show only notifications targeted to their role
  const filteredNotifications = notifications.filter(notification => 
    !notification.targetRoles || notification.targetRoles.length === 0 || notification.targetRoles.includes(userRole)
  );

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };

    if (isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsMenuOpen]);

  // Get role display name
  const getRoleName = (userRole: UserRole) => {
    switch (userRole) {
      case 'admin': return 'Admin';
      case 'requestor': return 'Preparator';
      case 'manager': return 'Manager';
      case 'manager_reviewer': return 'Reviewer';
      case 'manager_approver': return 'Approver';
      case 'approver': return 'Approver';
      case 'preparator': return 'Preparator';
      default: {
        const lowerRole = (userRole || '').toLowerCase();
        if (lowerRole.includes('reviewer')) return 'Reviewer';
        if (lowerRole.includes('approver')) return 'Approver';
        return userRole || 'User';
      }
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (!username || username.length === 0) return 'U';
    return username.substring(0, 2).toUpperCase();
  };

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

  return (
    <div className="contents">
      <div className="bg-white border-b border-slate-200 shadow-sm relative z-40 h-16 flex items-center overflow-hidden">
        {/* AI Animated Background Gradient */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 via-purple-500/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Animated AI Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-2 left-20 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute top-3 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
          <div className="absolute top-2 right-20 w-1 h-1 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
        </div>

        <div className="max-w-full mx-auto px-6 w-full relative z-10">
          <div className="flex items-center justify-between">
            {/* Left side - Breadcrumb/Navigation */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded p-1">
                <Menu className="h-5 w-5" />
              </Button>
              <Breadcrumbs 
                currentView={currentView}
                currentPage={currentPage}
                currentDocumentId={currentDocumentId}
                onNavigate={onNavigate}
              />
            </div>
            
            {/* Right side - Actions and User */}
            <div className="flex items-center space-x-2">
              {/* Chat Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg p-2 relative"
                onClick={() => {
                  if (onChatToggle) {
                    onChatToggle();
                  } else {
                    setLocalIsChatOpen(!localIsChatOpen);
                  }
                }}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </Button>
              
              {/* Notification Bell - Just the button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg p-2 relative"
                onClick={onNotificationToggle}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              
              {/* Settings Button with Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg p-2"
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                >
                  <Settings className="h-4 w-5" />
                </Button>
              </div>
              
              {/* User Profile Dropdown */}
              <div className="relative ml-1">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 hover:bg-slate-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                    <span className="text-sm font-medium">{getUserInitials()}</span>
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium text-slate-700">{username}</span>
                    <span className="text-xs text-slate-500">{getRoleName(userRole)}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel - Rendered as Overlay */}
      <NotificationCenter
        notifications={filteredNotifications}
        isOpen={isNotificationOpen}
        onToggle={onNotificationToggle}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onDeleteNotification={onDeleteNotification}
        onViewAll={() => {
          if (onNotificationToggle) {
            onNotificationToggle();
          }
          if (onNavigate) {
            onNavigate('notifications');
          }
        }}
        onNotificationClick={(notification) => {
          // Mark notification as read
          if (!notification.isRead && onMarkAsRead) {
            onMarkAsRead(notification.id);
          }
          
          // Close notification panel
          if (onNotificationToggle) {
            onNotificationToggle();
          }
          
          // Navigate based on notification type
          switch (notification.type) {
            case 'request_submitted':
            case 'approval_required':
            case 'form_approved':
            case 'form_rejected':
              // If notification has a requestId, open the form viewer
              if (notification.requestId && onViewForm) {
                onViewForm(notification.requestId);
              } else if (onNavigate) {
                // Fallback to reports page
                onNavigate('reports');
              }
              break;
            
            case 'template_published':
            case 'document_uploaded':
              // Navigate to document library
              if (onNavigate) {
                onNavigate('document-management');
              }
              break;
            
            default:
              // Default to dashboard
              if (onNavigate) {
                onNavigate('dashboard');
              }
              break;
          }
        }}
      />

      {/* Chat Panel */}
      <ChatPanel 
        isOpen={onChatToggle ? isChatOpen : localIsChatOpen} 
        onClose={() => {
          if (onChatToggle) {
            onChatToggle();
          } else {
            setLocalIsChatOpen(false);
          }
        }}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* User Profile Menu - Rendered as Overlay */}
      {isUserMenuOpen && (
        <div className="contents">
          {/* User Profile Dropdown */}
          <div 
            ref={userMenuRef}
            className="fixed top-20 right-6 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 transform transition-all duration-200 ease-out"
            style={{ animation: 'fadeInScale 0.2s ease-out' }}
          >
            {/* User Info Header */}
            <div className="px-5 py-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-start space-x-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <span className="text-xl font-semibold">{getUserInitials()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-slate-900 truncate">{username}</p>
                  <p className="text-sm text-slate-500 truncate mt-0.5">
                    {username.toLowerCase().replace(/\s+/g, '.')}@company.com
                  </p>
                  <div className="mt-2.5">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                      {getRoleName(userRole)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                className="w-full px-5 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  // Add profile navigation here if needed
                }}
              >
                <User className="h-4 w-4 text-slate-500" />
                <span>Profile</span>
              </button>

              <div className="border-t border-slate-100 my-2"></div>

              <button
                className="w-full px-5 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors font-medium"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  if (onSignOut) {
                    onSignOut();
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>

          {/* CSS Animation */}
          <style>{`
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
          `}</style>
        </div>
      )}

      {/* Settings Menu - Rendered as Overlay */}
      {isSettingsMenuOpen && (
        <div className="contents">
          <div 
            ref={settingsMenuRef}
            className="fixed top-20 right-48 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 transform transition-all duration-200 ease-out"
            style={{ animation: 'fadeInScale 0.2s ease-out' }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">Settings</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  if (onNavigate) {
                    onNavigate('enterprise');
                  }
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-100 transition-colors">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <span>Enterprise</span>
              </button>

              <button
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  if (onNavigate) {
                    onNavigate('departments');
                  }
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-100 transition-colors">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <span>Departments</span>
              </button>

              <button
                className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors group"
                onClick={() => {
                  setIsSettingsMenuOpen(false);
                  if (onNavigate) {
                    onNavigate('notifications');
                  }
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center group-hover:from-emerald-200 group-hover:to-emerald-100 transition-colors">
                  <Bell className="h-4 w-4 text-emerald-600" />
                </div>
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};