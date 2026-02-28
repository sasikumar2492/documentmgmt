import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from './ui/button';
import { BreadcrumbItem, ViewType } from '../types';

interface BreadcrumbsProps {
  currentView: ViewType;
  currentPage?: number;
  currentDocumentId?: string | null;
  onNavigate?: (view: ViewType) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  currentView, 
  currentPage, 
  currentDocumentId, 
  onNavigate 
}) => {
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: 'dashboard' }
    ];

    switch (currentView) {
      case 'dashboard':
        breadcrumbs[0].isActive = true;
        break;
      
      case 'upload-templates':
        breadcrumbs.push({ label: 'Smart AI Conversions', isActive: true });
        break;
      
      case 'raise-request':
        breadcrumbs.push({ label: 'Prepare', isActive: true });
        break;
      
      case 'reports':
        breadcrumbs.push({ label: 'Reports', isActive: true });
        break;
      
      case 'form':
        breadcrumbs.push(
          { label: 'Reports', href: 'reports' },
          { 
            label: currentPage ? `Form View - Page ${currentPage}` : 'Form View', 
            isActive: true 
          }
        );
        break;
      
      case 'approval-form':
        breadcrumbs.push(
          { label: 'Raise Request', href: 'raise-request' },
          { label: 'Request Form', isActive: true }
        );
        break;
      
      case 'workflows':
        breadcrumbs.push({ label: 'AI Workflow', isActive: true });
        break;
      
      case 'user-management':
        breadcrumbs.push({ label: 'User Management', isActive: true });
        break;
      
      case 'faq':
        breadcrumbs.push({ label: 'FAQ', isActive: true });
        break;
      
      case 'enterprise':
        breadcrumbs.push(
          { label: 'Settings', href: 'settings' },
          { label: 'Enterprise', isActive: true }
        );
        break;
      
      case 'configure-workflow':
        breadcrumbs.push(
          { label: 'AI Workflow', href: 'workflows' },
          { label: 'Configure Workflow', isActive: true }
        );
        break;
      
      default:
        breadcrumbs[0].isActive = true;
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleBreadcrumbClick = (href: string) => {
    if (onNavigate && href !== currentView) {
      onNavigate(href as ViewType);
    }
  };

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-600">
      <Home className="h-4 w-4 flex-shrink-0" />
      
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
          
          {item.isActive ? (
            <span className="text-light-blue font-medium whitespace-nowrap">{item.label}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => item.href && handleBreadcrumbClick(item.href)}
              className="h-auto p-0 text-slate-600 hover:text-light-blue hover:bg-transparent whitespace-nowrap"
            >
              {item.label}
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
};