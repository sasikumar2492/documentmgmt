import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Settings, 
  MessageCircleQuestion,
  Upload,
  FilePlus,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Bell,
  Folder,
  TrendingUp,
  Clock,
  FolderOpen,
  GitBranch,
  Sparkles,
  Zap,
  Brain,
  FolderTree,
  Library,
  BarChart3,
  ScrollText,
  CheckCircle,
  ClipboardList,
  FileCheck,
  GraduationCap,
  GitCompare
} from 'lucide-react';
import { ViewType, UserRole } from '../types';
import logo from 'figma:asset/959a9d3635cfe8c94a3f28db7f3ab3925aae9843.png';

interface LeftSidebarProps {
  isCollapsed: boolean;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onToggleCollapse: () => void;
  onChatToggle?: () => void;
  userRole?: UserRole;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  isCollapsed, 
  currentView, 
  onViewChange,
  onToggleCollapse,
  onChatToggle,
  userRole = 'admin'
}) => {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const forYouItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  // Define all menu items with role permissions
  const allMenuItems = [
    { id: 'document-management', label: 'AI Conversion', icon: Sparkles, isAI: true, roles: ['admin', 'requestor', 'preparator'] },
    { id: 'raise-request', label: 'Raise Request', icon: FilePlus, roles: ['admin', 'requestor', 'preparator'] },
    { id: 'document-library', label: 'Document Library', icon: Library, roles: ['admin', 'requestor', 'preparator', 'manager', 'manager_reviewer', 'manager_approver', 'approver'] },
    { id: 'document-effectiveness', label: 'Document Effectiveness', icon: TrendingUp, roles: ['admin', 'manager', 'preparator', 'requestor', 'reviewer', 'approver'] },
    { id: 'activity-log', label: 'Activity Log', icon: ClipboardList, roles: ['preparator', 'requestor', 'manager', 'manager_reviewer', 'manager_approver', 'reviewer', 'approver'] },
    { id: 'reports-analytics', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager', 'manager_reviewer', 'manager_approver', 'approver', 'reviewer'] },
    { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList, roles: ['admin'] },
    // Manager-specific menu items
    { id: 'training-management', label: 'Training Management', icon: GraduationCap, roles: [] },
    { id: 'document-versioning', label: 'Document Versioning', icon: GitCompare, roles: ['manager'] },
  ];

  // Filter menu items based on user role
  const topMenuItems = allMenuItems.filter(item => {
    if (!userRole) return false;
    
    const role = userRole.toLowerCase();
    
    // Direct match
    if (item.roles.includes(userRole)) return true;
    
    // Substring matches for numbered roles
    if (role.includes('reviewer') && (item.roles.includes('reviewer') || item.roles.includes('manager_reviewer'))) return true;
    if (role.includes('approver') && (item.roles.includes('approver') || item.roles.includes('manager_approver'))) return true;
    if (role.includes('preparator') && item.roles.includes('preparator')) return true;
    if (role.includes('requestor') && item.roles.includes('requestor')) return true;
    
    return false;
  });

  const isReviewerOrApprover = (userRole || '').toLowerCase().includes('reviewer') || 
                               (userRole || '').toLowerCase().includes('approver') ||
                               (userRole || '').toLowerCase().includes('preparator') ||
                               (userRole || '').toLowerCase().includes('requestor');

  const appsMenuItems = [
    { id: 'chat', label: 'Chat', icon: MessageCircleQuestion },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: true },
  ];

  const settingsSubItems = [
    { id: 'enterprise', label: 'Enterprise', icon: Building2 },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'settings') {
      setIsSettingsExpanded(!isSettingsExpanded);
    } else if (itemId === 'chat') {
      onViewChange('chat' as ViewType);
    } else if (itemId === 'faq') {
      onViewChange('faq' as ViewType);
    } else if (itemId === 'dashboard' || itemId === 'upload-templates' || itemId === 'raise-request' || itemId === 'reports' || itemId === 'reports-analytics' || itemId === 'document-management' || itemId === 'document-library' || itemId === 'departments' || itemId === 'notifications' || itemId === 'user-management' || itemId === 'enterprise' || itemId === 'audit-logs' || itemId === 'activity-log' || itemId === 'training-management' || itemId === 'document-effectiveness' || itemId === 'document-versioning') {
      onViewChange(itemId as ViewType);
    } else {
      // For other menu items, show placeholder or implement functionality
      alert(`${itemId.charAt(0).toUpperCase() + itemId.slice(1).replace('-', ' ')} - Coming Soon!`);
    }
  };

  return (
    <div className={`
      flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50 border-r-2 border-gray-200 shadow-lg transition-all duration-300 ease-in-out relative z-30 h-screen overflow-hidden
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Logo Section */}
      <div className="p-4 border-b-2 border-gray-200 bg-white shadow-sm flex-shrink-0 relative z-10">
        {!isCollapsed ? (
          <div className="flex flex-col gap-3">
            {/* FedHub Logo */}
            <div className="flex items-center justify-center">
              <img src={logo} alt="FedHub Logo" className="h-12 w-auto" />
            </div>
            {/* Document Management System with AI Badge */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <h2 className="text-black font-semibold text-center">Document Management</h2>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs text-gray-500 text-center">System</p>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30">
                    <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
                    <span className="text-xs text-blue-400">AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* FedHub Logo - Collapsed */}
            <div className="flex items-center justify-center">
              <img src={logo} alt="FedHub Logo" className="h-8 w-auto" />
            </div>
            {/* AI Icon indicator */}
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-500/30 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Menu Items */}
      <div className="flex-1 p-3 overflow-y-auto min-h-0">
        {/* FOR YOU Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <div className="text-xs uppercase text-gray-500 font-semibold mb-2 px-3">For You</div>
          )}
          <div className="space-y-1">
            {forYouItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full justify-start transition-all duration-200 rounded-lg
                    ${isCollapsed ? 'px-2' : 'px-3'}
                    ${isActive 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Main Menu Section */}
        <div className="mb-6">
          {!isCollapsed && (
            <div className="text-xs uppercase text-gray-500 font-semibold mb-2 px-3 flex items-center gap-2">
              Main
              <div className="h-px flex-1 bg-gradient-to-r from-gray-300 via-blue-200 to-transparent"></div>
            </div>
          )}
          <div className="space-y-1">
            {topMenuItems.map((item) => {
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
                    className={`
                      w-full justify-start transition-all duration-200 rounded-lg relative z-10
                      ${isCollapsed ? 'px-2' : 'px-3'}
                      ${isActive 
                        ? item.isAI 
                          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg shadow-blue-500/50' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        : item.isAI
                          ? 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 hover:text-white hover:shadow-md'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={`${item.isAI ? 'relative' : ''}`}>
                      {item.isAI && (
                        <div className="contents">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-full blur-md opacity-40 animate-pulse"></div>
                          <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} relative z-10`} />
                        </div>
                      )}
                      {!item.isAI && (
                        <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm">{item.label}</span>
                        {item.isAI && (
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-400 animate-pulse" style={{ animationDuration: '1.5s' }} />
                            <Brain className="h-3 w-3 text-purple-400 animate-pulse" style={{ animationDuration: '2s' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* APPS Section - Strictly Admin Only */}
        {userRole?.toLowerCase() === 'admin' && !userRole?.toLowerCase().includes('manager') && !userRole?.toLowerCase().includes('preparator') && !userRole?.toLowerCase().includes('approver') && !userRole?.toLowerCase().includes('reviewer') && (
          <div className="mt-4">
            {!isCollapsed && (
              <div className="text-xs uppercase text-gray-500 font-semibold mb-2 px-3">Apps</div>
            )}
            <div className="space-y-1">
              {appsMenuItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      onClick={() => handleItemClick(item.id)}
                      className={`
                        w-full justify-start transition-all duration-200 rounded-lg
                        ${isCollapsed ? 'px-2' : 'px-3'}
                        text-gray-700 hover:bg-blue-50 hover:text-blue-600
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                      {!isCollapsed && (
                        <div className="flex items-center flex-1">
                          <span className="text-sm flex-1 text-left">{item.label}</span>
                          {item.hasSubmenu && (
                            isSettingsExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          )}
                        </div>
                      )}
                    </Button>
                    
                    {/* Submenu for Settings */}
                    {item.id === 'settings' && !isCollapsed && isSettingsExpanded && (
                      <div className="mt-1 ml-8 space-y-1">
                        {settingsSubItems.map((subItem) => {
                          const Icon = subItem.icon;
                          return (
                            <div key={subItem.id}>
                              <Button
                                variant="ghost"
                                onClick={() => handleItemClick(subItem.id)}
                                className={`
                                  w-full justify-start transition-all duration-200 rounded-lg
                                  ${isCollapsed ? 'px-2' : 'px-3'}
                                  text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                `}
                                title={isCollapsed ? subItem.label : undefined}
                              >
                                <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                                {!isCollapsed && (
                                  <span className="text-sm flex-1 text-left">{subItem.label}</span>
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer with version */}
      <div className="p-3 border-t-2 border-gray-200 bg-white">
        {!isCollapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-gray-500">Version 1.0.0</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1 h-auto"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                Powered by <span className="text-gray-800 font-semibold">FedHub Software</span>
              </p>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-1 h-auto mx-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};