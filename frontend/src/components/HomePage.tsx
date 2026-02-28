import React, { useState } from 'react';
import {
  FileText,
  Ticket,
  LogIn,
  Building2,
  MousePointerClick,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { Button } from './ui/button';

interface HomePageProps {
  onNavigateToDMS: () => void;
  onNavigateToLogin: () => void;
  onNavigateToTicketFlow: () => void;
  onNavigateToQMS?: () => void;
  onNavigateToIOT?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigateToDMS, onNavigateToLogin, onNavigateToTicketFlow, onNavigateToQMS, onNavigateToIOT }) => {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const modules = [
    {
      id: 'dms',
      title: 'Document Management',
      icon: FileText,
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-100',
      iconBgColor: 'bg-cyan-500',
      textColor: 'text-cyan-700',
      clickIconColor: 'text-cyan-500',
      onClick: onNavigateToDMS
    },
    {
      id: 'ticketflow',
      title: 'Ticket Flow',
      icon: Ticket,
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
      iconBgColor: 'bg-purple-500',
      textColor: 'text-purple-700',
      clickIconColor: 'text-purple-500',
      onClick: onNavigateToTicketFlow
    },
    {
      id: 'qms',
      title: 'Quality Management System',
      icon: ShieldCheck,
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
      iconBgColor: 'bg-green-500',
      textColor: 'text-green-700',
      clickIconColor: 'text-green-500',
      onClick: onNavigateToQMS || (() => console.log('QMS clicked'))
    },
    {
      id: 'iot',
      title: 'IOT Management',
      icon: Radio,
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-100',
      iconBgColor: 'bg-orange-500',
      textColor: 'text-orange-700',
      clickIconColor: 'text-orange-500',
      onClick: onNavigateToIOT || (() => console.log('IOT clicked'))
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Login */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="w-full px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Enterprise Portal
                </h1>
                <p className="text-xs text-slate-600">Access your business applications</p>
              </div>
            </div>
            <Button
              onClick={onNavigateToLogin}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Choose Your Application
          </h2>
          <p className="text-lg text-slate-600">
            Select a module to get started
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {modules.map((module) => (
            <button
              key={module.id}
              onMouseEnter={() => setHoveredModule(module.id)}
              onMouseLeave={() => setHoveredModule(null)}
              onClick={module.onClick}
              className={`group relative ${module.bgColor} rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                hoveredModule === module.id ? 'shadow-2xl scale-105' : 'shadow-lg'
              }`}
            >
              {/* Icon Circle */}
              <div className="flex justify-center mb-6">
                <div className={`${module.iconBgColor} rounded-full p-5 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <module.icon className="h-10 w-10 text-white" strokeWidth={2} />
                </div>
              </div>

              {/* Title */}
              <h3 className={`${module.textColor} text-lg font-semibold text-center mb-6 transition-all group-hover:scale-105`}>
                {module.title}
              </h3>

              {/* Click Indicator */}
              <div className="flex justify-center">
                <MousePointerClick 
                  className={`h-5 w-5 ${module.clickIconColor} transition-all duration-300 group-hover:scale-125 group-hover:animate-pulse`}
                />
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Building2 className="h-4 w-4" />
              <span>© 2024 Enterprise Portal. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};