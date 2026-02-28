import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck,
  Building2,
  FileText,
  GitBranch,
  FileSearch,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle,
  MessageCircleQuestion,
  Crown,
  Sparkles,
  Wand2,
  PlusCircle,
  Library,
  Inbox,
  GraduationCap,
  TrendingUp,
  History,
  ClipboardList,
  Zap,
  Brain
} from 'lucide-react';
import { ViewType, UserRole } from '../types';
import { Badge } from './ui/badge';

interface AdminSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  currentView, 
  onViewChange, 
  userRole,
  isCollapsed,
  onToggleCollapse
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const settingsSubItems = [
    { id: 'user-management', label: 'User Management', icon: Users },
    { id: 'department-setup', label: 'Department Setup', icon: Building2 },
    { id: 'enterprise', label: 'Enterprise Setup', icon: ShieldCheck },
  ];

  // Admin-specific menu items
  const adminMenuItems = [
    { 
      id: 'admin-home', 
      label: 'Admin Dashboard', 
      icon: LayoutDashboard,
      gradient: 'from-purple-500 to-indigo-600',
      bgHover: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50',
      iconColor: 'text-purple-600'
    },
    { 
      id: 'document-management', 
      label: 'AI Conversion', 
      icon: Sparkles,
      isAI: true,
      gradient: 'from-blue-600 via-purple-600 to-indigo-600',
      bgHover: 'hover:bg-gradient-to-r hover:from-blue-50 via-purple-50 to-indigo-50',
      iconColor: 'text-blue-600'
    },
    { 
      id: 'raise-request', 
      label: 'Raise Request', 
      icon: PlusCircle,
      gradient: 'from-emerald-500 to-teal-600',
      bgHover: 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50',
      iconColor: 'text-emerald-600'
    },
    { 
      id: 'document-library', 
      label: 'Document Library', 
      icon: Library,
      gradient: 'from-blue-600 to-indigo-700',
      bgHover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50',
      iconColor: 'text-blue-700'
    },
    { 
      id: 'document-effectiveness', 
      label: 'Document Effectiveness', 
      icon: TrendingUp,
      gradient: 'from-rose-500 to-pink-600',
      bgHover: 'hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50',
      iconColor: 'text-rose-600'
    },
    { 
      id: 'document-versioning', 
      label: 'Document Versioning', 
      icon: History,
      gradient: 'from-slate-600 to-gray-700',
      bgHover: 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50',
      iconColor: 'text-slate-700'
    },
    { 
      id: 'audit-logs', 
      label: 'Audit Logs', 
      icon: FileSearch,
      gradient: 'from-slate-500 to-gray-600',
      bgHover: 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50',
      iconColor: 'text-slate-600'
    },
    { 
      id: 'reports-analytics', 
      label: 'Reports & Analytics', 
      icon: BarChart3,
      gradient: 'from-teal-500 to-cyan-600',
      bgHover: 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50',
      iconColor: 'text-teal-600'
    },
  ];

  const bottomMenuItems = [
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      iconColor: 'text-slate-600'
    },
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'settings') {
      setIsSettingsExpanded(!isSettingsExpanded);
    } else {
      onViewChange(itemId as ViewType);
    }
  };

  return (
    <div className={`bg-gradient-to-b from-gray-50 via-white to-gray-50 border-r-2 border-gray-200 shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Header Section with Admin Badge */}
      <div className="p-4 border-b-2 border-gray-200 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-slate-900 font-bold text-sm">Admin Panel</h2>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs border-0 mt-0.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Full Access
                </Badge>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-auto hover:bg-gray-100 text-slate-600 hover:text-slate-900"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
              <Crown className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Admin Menu Items */}
      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        {!isCollapsed && (
          <div className="mb-3 px-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Administration
            </p>
          </div>
        )}
        <div className="space-y-1.5">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <div key={item.id} className="relative">
                {/* AI Glow Effect for AI Items */}
                {item.isAI && !isCollapsed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent rounded-lg blur-sm animate-pulse"></div>
                )}
                
                <Button
                  variant="ghost"
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full justify-start p-3 h-auto transition-all duration-200 group relative overflow-hidden ${
                    isActive 
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg` 
                      : `text-slate-700 hover:text-slate-900 hover:bg-gray-100 hover:shadow-md`
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  
                  {/* Icon with animation */}
                  <div className={`${isCollapsed ? '' : 'mr-3'} relative flex-shrink-0`}>
                    {item.isAI && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full blur-md opacity-40 animate-pulse"></div>
                        <Icon 
                          className={`h-5 w-5 transition-all duration-200 relative z-10 ${
                            isActive ? 'scale-110' : 'group-hover:scale-110'
                          }`}
                        />
                      </div>
                    )}
                    {!item.isAI && (
                      <Icon 
                        className={`h-5 w-5 transition-all duration-200 ${
                          isActive ? 'scale-110' : 'group-hover:scale-110'
                        } ${!isActive && hoveredItem === item.id ? 'animate-pulse' : ''}`}
                      />
                    )}
                  </div>
                  
                  {/* Label */}
                  {!isCollapsed && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium transition-all duration-200 truncate">
                        {item.label}
                      </span>
                      {item.isAI && (
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-yellow-400 animate-pulse" style={{ animationDuration: '1.5s' }} />
                          <Brain className="h-3 w-3 text-purple-400 animate-pulse" style={{ animationDuration: '2s' }} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Hover glow effect */}
                  {!isActive && hoveredItem === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-30 rounded-lg" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-gray-300 flex-shrink-0" />

      {/* Bottom Menu Items */}
      <div className="p-3 flex-shrink-0">
        {!isCollapsed && (
          <div className="mb-3 px-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Support
            </p>
          </div>
        )}
        <div className="space-y-1.5">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const hasSubmenu = item.id === 'settings';
            
            return (
              <div key={item.id}>
                <Button
                  variant="ghost"
                  onClick={() => handleItemClick(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`w-full justify-start p-3 h-auto transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gray-200 text-slate-900 shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-transform group-hover:scale-110 flex-shrink-0`} />
                  {!isCollapsed && (
                    <div className="flex items-center flex-1">
                      <span className="text-sm font-medium truncate flex-1 text-left">{item.label}</span>
                      {hasSubmenu && (
                        isSettingsExpanded ? (
                          <ChevronLeft className="h-4 w-4 rotate-90 transition-transform" />
                        ) : (
                          <ChevronLeft className="h-4 w-4 -rotate-90 transition-transform" />
                        )
                      )}
                    </div>
                  )}
                </Button>

                {/* Submenu for Settings */}
                {hasSubmenu && !isCollapsed && isSettingsExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 pl-2">
                    {settingsSubItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = currentView === subItem.id;
                      return (
                        <Button
                          key={subItem.id}
                          variant="ghost"
                          onClick={() => handleItemClick(subItem.id)}
                          className={`w-full justify-start p-2 h-auto transition-all duration-200 rounded-md ${
                            isSubActive 
                              ? 'bg-blue-50 text-blue-600 font-semibold' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <SubIcon className="h-4 w-4 mr-2" />
                          <span className="text-xs font-medium">{subItem.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Version Info */}
      {!isCollapsed && (
        <div className="p-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          <div className="text-center">
            <p className="text-xs text-slate-600 font-medium">Version 1.0.0</p>
            <p className="text-xs text-slate-500 mt-1">Admin Console</p>
          </div>
        </div>
      )}
    </div>
  );
};