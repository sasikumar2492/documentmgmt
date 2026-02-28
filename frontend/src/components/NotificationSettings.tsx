import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  Users,
  User,
  Shield,
  Settings,
  Save,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

interface UserNotificationSettings {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  department: string;
  preferences: NotificationPreference[];
}

export const NotificationSettings: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  // Global notification settings for current user
  const [globalEmailNotifications, setGlobalEmailNotifications] = useState(true);
  const [globalInAppNotifications, setGlobalInAppNotifications] = useState(true);

  // Default notification preferences structure
  const defaultPreferences: NotificationPreference[] = [
    {
      id: 'workflow',
      label: 'Workflow Notifications',
      description: 'Notifications related to workflow assignments and updates',
      email: true,
      inApp: true
    },
    {
      id: 'approval',
      label: 'Approval Notifications',
      description: 'When approval is required or status changes',
      email: true,
      inApp: true
    },
    {
      id: 'requestor',
      label: 'Requestor Notifications',
      description: 'Notifications for request submission and status updates',
      email: true,
      inApp: true
    },
    {
      id: 'initial_review',
      label: 'Initial Review Notifications',
      description: 'Notifications during initial review stage',
      email: true,
      inApp: true
    },
    {
      id: 'qa_review',
      label: 'QA Review Notifications',
      description: 'Notifications during Quality Assurance review stage',
      email: true,
      inApp: true
    }
  ];

  // Current user settings
  const [userPreferences, setUserPreferences] = useState<NotificationPreference[]>([...defaultPreferences]);

  const handleTogglePreference = (preferenceId: string, type: 'email' | 'inApp') => {
    setUserPreferences(userPreferences.map(pref => {
      if (pref.id === preferenceId) {
        return { ...pref, [type]: !pref[type] };
      }
      return pref;
    }));
  };

  const handleSaveSettings = () => {
    // In production, save to API
    console.log('Saving notification settings:', userPreferences);
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleEnableAll = () => {
    setUserPreferences(userPreferences.map(pref => ({
      ...pref,
      email: true,
      inApp: true
    })));
  };

  const handleDisableAll = () => {
    setUserPreferences(userPreferences.map(pref => ({
      ...pref,
      email: false,
      inApp: false
    })));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'from-red-500 to-red-600';
      case 'Manager':
        return 'from-blue-500 to-blue-600';
      case 'Team Lead':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-green-500 to-green-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-slate-800 flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              Notification Settings
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your notification preferences
            </p>
          </div>
          
          {currentUser?.role === 'Admin' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Admin Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Global Notification Settings */}
      <Card className="mb-6 border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-lg shadow-md">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Global Notification Preferences
              </h2>
              <p className="text-sm text-slate-600">Control your email and in-app notifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Notifications */}
            <div className="bg-white p-5 rounded-lg border-2 border-blue-100 hover:border-blue-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Email Notifications</h3>
                    <p className="text-xs text-slate-500">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={globalEmailNotifications}
                  onCheckedChange={setGlobalEmailNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-blue-600"
                />
              </div>
              <div className="text-xs text-slate-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                {globalEmailNotifications ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    Email notifications are <span className="font-semibold text-green-700">enabled</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    Email notifications are <span className="font-semibold text-red-700">disabled</span>
                  </span>
                )}
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="bg-white p-5 rounded-lg border-2 border-purple-100 hover:border-purple-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">In-App Notifications</h3>
                    <p className="text-xs text-slate-500">Receive notifications in the app</p>
                  </div>
                </div>
                <Switch
                  checked={globalInAppNotifications}
                  onCheckedChange={setGlobalInAppNotifications}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-purple-600"
                />
              </div>
              <div className="text-xs text-slate-600 bg-purple-50 p-3 rounded-md border border-purple-100">
                {globalInAppNotifications ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    In-app notifications are <span className="font-semibold text-green-700">enabled</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-600" />
                    In-app notifications are <span className="font-semibold text-red-700">disabled</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-700">
                <p className="font-semibold text-cyan-800 mb-1">Quick Toggle</p>
                <p className="text-slate-600">
                  These settings provide quick control over all your notifications. 
                  You can still customize individual notification types below for more granular control.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Users List with Notification Settings */}
      <div className="space-y-6">
        <Accordion type="multiple" className="space-y-6">
          <AccordionItem 
            key={currentUser?.id} 
            value={currentUser?.id}
            className="border-0"
          >
            <Card className="border-slate-200 bg-white shadow-md overflow-hidden">
              {/* User Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {currentUser?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-slate-800 font-semibold flex items-center gap-2">
                          {currentUser?.name}
                          {currentUser?.role === 'Admin' && (
                            <Shield className="h-4 w-4 text-red-600" />
                          )}
                        </h3>
                        <AccordionTrigger className="ml-auto hover:no-underline p-2">
                          <span className="sr-only">Toggle notification settings</span>
                        </AccordionTrigger>
                      </div>
                      <p className="text-sm text-slate-600">{currentUser?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs text-white bg-gradient-to-r ${getRoleBadgeColor(currentUser?.role)}`}>
                          {currentUser?.role}
                        </span>
                        <span className="text-xs text-slate-500">{currentUser?.department}</span>
                      </div>
                    </div>
                  </div>

                  {currentUser?.role === 'Admin' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={handleEnableAll}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Enable All
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDisableAll}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Disable All
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Preferences - Collapsible */}
              <AccordionContent>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm text-slate-700">
                            Notification Type
                          </th>
                          <th className="text-center py-3 px-4 text-sm text-slate-700">
                            <div className="flex items-center justify-center gap-1">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span>Email</span>
                            </div>
                          </th>
                          <th className="text-center py-3 px-4 text-sm text-slate-700">
                            <div className="flex items-center justify-center gap-1">
                              <Bell className="h-4 w-4 text-purple-600" />
                              <span>In-App</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {userPreferences.map((pref, index) => (
                          <tr 
                            key={pref.id} 
                            className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            }`}
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm font-medium text-slate-800">{pref.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{pref.description}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex justify-center">
                                <Switch
                                  checked={pref.email}
                                  onCheckedChange={() => handleTogglePreference(pref.id, 'email')}
                                />
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex justify-center">
                                <Switch
                                  checked={pref.inApp}
                                  onCheckedChange={() => handleTogglePreference(pref.id, 'inApp')}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSaveSettings}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
        >
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Save Notification */}
      {showSaveNotification && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Empty State */}
      {userPreferences.length === 0 && (
        <Card className="p-12 text-center border-slate-200">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-700 font-medium mb-2">No users found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search or filter criteria</p>
        </Card>
      )}
    </div>
  );
};