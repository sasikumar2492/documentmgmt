import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Settings, 
  MessageCircleQuestion,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const topMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'user-management', label: 'User Management', icon: Users },
  ];

  const bottomMenuItems = [
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'faq', label: 'FAQ', icon: MessageCircleQuestion },
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'dashboard') {
      onViewChange('dashboard');
    } else {
      // For other menu items, show placeholder or implement functionality
      alert(`${itemId.charAt(0).toUpperCase() + itemId.slice(1).replace('-', ' ')} - Coming Soon!`);
    }
  };

  return (
    <div className={`bg-white border-r-2 border-logo-blue-light shadow-lg transition-all duration-300 ${
      isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'
    }`}>
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Top Menu Items */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            {topMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = (item.id === 'dashboard' && currentView === 'dashboard') || 
                              (item.id === 'user-management' && currentView === 'user-management');
              
              return (
                <div key={item.id}>
                  <Button
                    variant="ghost"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full justify-start p-3 h-auto transition-all duration-200 ${
                      isActive 
                        ? 'bg-logo-blue text-white hover:bg-logo-blue-light' 
                        : 'text-slate-700 hover:bg-blue-50 hover:text-logo-blue'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
                    {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="sidebar-divider mx-4"></div>

        {/* Bottom Menu Items */}
        <div className="p-4">
          <div className="space-y-2">
            {bottomMenuItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <div key={item.id}>
                  <Button
                    variant="ghost"
                    onClick={() => handleItemClick(item.id)}
                    className="w-full justify-start p-3 h-auto text-slate-700 hover:bg-blue-50 hover:text-logo-blue transition-all duration-200"
                  >
                    <Icon className={`h-5 w-5 ${isExpanded ? 'mr-3' : ''}`} />
                    {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};