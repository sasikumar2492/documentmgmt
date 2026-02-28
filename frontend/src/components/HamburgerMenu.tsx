import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Users, 
  HelpCircle, 
  Settings, 
  MessageCircleQuestion,
  X,
  Upload,
  FileCheck,
  FilePlus,
  FileText,
  FolderOpen,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Building2,
  Bell
} from 'lucide-react';
import { ViewType } from '../types';

interface HamburgerMenuProps {
  isOpen: boolean;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onClose: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  isOpen, 
  currentView, 
  onViewChange, 
  onClose 
}) => {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'document-management', label: 'Document Management', icon: FolderOpen },
    { id: 'workflows', label: 'AI Workflow', icon: GitBranch },
    { id: 'raise-request', label: 'Prepare', icon: FilePlus },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'user-management', label: 'User Management', icon: Users },
  ];

  const bottomMenuItems = [
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: true },
    { id: 'faq', label: 'FAQ', icon: MessageCircleQuestion },
  ];

  const settingsSubItems = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'settings') {
      setIsSettingsExpanded(!isSettingsExpanded);
    } else if (itemId === 'dashboard' || itemId === 'upload-templates' || itemId === 'raise-request' || itemId === 'reports' || itemId === 'document-management' || itemId === 'workflows' || itemId === 'user-management' || itemId === 'departments' || itemId === 'notifications') {
      onViewChange(itemId as ViewType);
      onClose();
    } else {
      // For other menu items, show placeholder or implement functionality
      alert(`${itemId.charAt(0).toUpperCase() + itemId.slice(1).replace('-', ' ')} - Coming Soon!`);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`hamburger-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-drawer-header bg-drawer-header">
            <h3 className="text-white font-medium">Navigation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-drawer-header-light hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Top Menu Items */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              <div className="text-xs uppercase text-gray-300 font-semibold mb-3">Main Menu</div>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full justify-start p-3 h-auto transition-all duration-200 ${
                        isActive 
                          ? 'drawer-item-active' 
                          : 'text-gray-200 drawer-item-hover hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-400 mx-4"></div>

          {/* Bottom Menu Items */}
          <div className="p-4">
            <div className="space-y-2">
              <div className="text-xs uppercase text-gray-300 font-semibold mb-3">Support</div>
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <div key={item.id}>
                    <Button
                      variant="ghost"
                      onClick={() => handleItemClick(item.id)}
                      className="w-full justify-start p-3 h-auto text-gray-200 drawer-item-hover hover:text-white transition-all duration-200"
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      {item.hasSubmenu && (
                        isSettingsExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      )}
                    </Button>
                    
                    {/* Submenu for Settings */}
                    {item.id === 'settings' && isSettingsExpanded && (
                      <div className="mt-1 ml-8 space-y-1">
                        {settingsSubItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <div key={subItem.id}>
                              <Button
                                variant="ghost"
                                onClick={() => handleItemClick(subItem.id)}
                                className="w-full justify-start p-2 h-auto text-gray-300 hover:text-white drawer-item-hover transition-all duration-200 text-sm"
                              >
                                <SubIcon className="h-4 w-4 mr-2" />
                                <span className="flex-1 text-left">{subItem.label}</span>
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
        </div>
      </div>
    </>
  );
};