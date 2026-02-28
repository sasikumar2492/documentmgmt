import React from 'react';
import { Button } from './ui/button';
import { LogOut, User, Menu } from 'lucide-react';
import { ViewType } from '../types';
import logo from 'figma:asset/959a9d3635cfe8c94a3f28db7f3ab3925aae9843.png';

interface HeaderProps {
  isSignedIn: boolean;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isSignedIn, 
  currentView, 
  onViewChange, 
  onSignOut,
  onMenuToggle 
}) => (
  <div className="bg-logo-blue border-b-2 border-logo-blue-light shadow-lg">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Hamburger Menu Button */}
          {isSignedIn && onMenuToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="text-white hover:bg-logo-blue-light hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <img src={logo} alt="FedHub" className="h-12 w-auto" />
          <div>
            <h1 className="text-xl text-white">Document Management System</h1>
          </div>
        </div>
        
        {isSignedIn && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User className="h-4 w-4" />
              <span className="text-sm">Welcome, User</span>
            </div>
            <Button
              variant="outline"
              onClick={onSignOut}
              className="flex items-center space-x-2 border-white text-white hover:bg-white hover:text-logo-blue"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);