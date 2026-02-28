import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Timer, 
  User, 
  Mail, 
  ChevronUp,
  Save,
  X,
  Bell,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface EscalationLevel {
  id: string;
  level: number;
  name: string;
  timeThreshold: number; // in hours
  assignee: string;
  role: string;
  email: string;
  notifyEmail: boolean;
  notifyInApp: boolean;
}

interface EscalationConfigProps {
  departmentName: string;
  departmentColor: string;
  departmentId: string;
  onClose: () => void;
}

export const EscalationConfig: React.FC<EscalationConfigProps> = ({
  departmentName,
  departmentColor,
  departmentId,
  onClose
}) => {
  // Default escalation levels based on department
  const getDefaultEscalations = (): EscalationLevel[] => {
    return [
      {
        id: '1',
        level: 1,
        name: 'Team Lead Review',
        timeThreshold: 4,
        assignee: 'Team Lead',
        role: 'Department Lead',
        email: 'team.lead@company.com',
        notifyEmail: true,
        notifyInApp: true
      },
      {
        id: '2',
        level: 2,
        name: 'Manager Approval',
        timeThreshold: 8,
        assignee: 'Department Manager',
        role: 'Manager',
        email: 'manager@company.com',
        notifyEmail: true,
        notifyInApp: true
      },
      {
        id: '3',
        level: 3,
        name: 'Director Escalation',
        timeThreshold: 24,
        assignee: 'Department Director',
        role: 'Director',
        email: 'director@company.com',
        notifyEmail: true,
        notifyInApp: true
      }
    ];
  };

  const [escalationLevels, setEscalationLevels] = useState<EscalationLevel[]>(getDefaultEscalations());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddLevel = () => {
    const newLevel: EscalationLevel = {
      id: Date.now().toString(),
      level: escalationLevels.length + 1,
      name: `Level ${escalationLevels.length + 1}`,
      timeThreshold: 12,
      assignee: '',
      role: '',
      email: '',
      notifyEmail: true,
      notifyInApp: true
    };
    setEscalationLevels([...escalationLevels, newLevel]);
    setEditingId(newLevel.id);
  };

  const handleDeleteLevel = (id: string) => {
    setEscalationLevels(escalationLevels.filter(level => level.id !== id));
  };

  const handleUpdateLevel = (id: string, field: keyof EscalationLevel, value: any) => {
    setEscalationLevels(escalationLevels.map(level => 
      level.id === id ? { ...level, [field]: value } : level
    ));
  };

  const handleSave = () => {
    console.log('Saving escalation config for', departmentName, escalationLevels);
    alert(`Escalation configuration saved successfully for ${departmentName}!`);
    onClose();
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'from-blue-500 to-blue-600';
      case 2: return 'from-orange-500 to-orange-600';
      case 3: return 'from-red-500 to-red-600';
      default: return 'from-purple-500 to-purple-600';
    }
  };

  const getLevelBg = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-50';
      case 2: return 'bg-orange-50';
      case 3: return 'bg-red-50';
      default: return 'bg-purple-50';
    }
  };

  const getLevelBorder = (level: number) => {
    switch (level) {
      case 1: return 'border-blue-200';
      case 2: return 'border-orange-200';
      case 3: return 'border-red-200';
      default: return 'border-purple-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className={`bg-gradient-to-r ${departmentColor} text-white p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Escalation Configuration</h2>
              <p className="text-sm text-white/90">{departmentName} Department</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Section */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="p-4 flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-slate-800 mb-1">Automated Escalation Process</h3>
                <p className="text-sm text-slate-600">
                  Configure escalation levels to automatically notify team members when requests exceed time thresholds. 
                  Each level triggers when the previous level's time threshold is reached without resolution.
                </p>
              </div>
            </div>
          </Card>

          {/* Escalation Levels */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-800">Escalation Levels</h3>
              <Button
                onClick={handleAddLevel}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </div>

            {escalationLevels.length === 0 ? (
              <Card className="bg-slate-50 border-slate-200">
                <div className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">No escalation levels configured</p>
                  <Button
                    onClick={handleAddLevel}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Level
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {escalationLevels.map((level, index) => (
                  <Card 
                    key={level.id} 
                    className={`${getLevelBg(level.level)} ${getLevelBorder(level.level)} border-2 overflow-hidden`}
                  >
                    {/* Level Header */}
                    <div className={`bg-gradient-to-r ${getLevelColor(level.level)} text-white p-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                          {level.level}
                        </div>
                        <div>
                          <h4 className="font-semibold">{level.name}</h4>
                          <p className="text-xs text-white/90 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Escalates after {level.timeThreshold} hours
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Level Details */}
                    <div className="p-4 space-y-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Level Name */}
                        <div className="space-y-2">
                          <Label className="text-slate-700 flex items-center gap-2">
                            <ChevronUp className="h-4 w-4" />
                            Level Name
                          </Label>
                          <Input
                            value={level.name}
                            onChange={(e) => handleUpdateLevel(level.id, 'name', e.target.value)}
                            placeholder="e.g., Manager Review"
                            className="border-slate-300"
                          />
                        </div>

                        {/* Time Threshold */}
                        <div className="space-y-2">
                          <Label className="text-slate-700 flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            Time Threshold (hours)
                          </Label>
                          <Input
                            type="number"
                            value={level.timeThreshold}
                            onChange={(e) => handleUpdateLevel(level.id, 'timeThreshold', parseInt(e.target.value))}
                            placeholder="4"
                            className="border-slate-300"
                          />
                        </div>

                        {/* Assignee */}
                        <div className="space-y-2">
                          <Label className="text-slate-700 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Assignee Name
                          </Label>
                          <Input
                            value={level.assignee}
                            onChange={(e) => handleUpdateLevel(level.id, 'assignee', e.target.value)}
                            placeholder="e.g., John Smith"
                            className="border-slate-300"
                          />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                          <Label className="text-slate-700">Role/Position</Label>
                          <Input
                            value={level.role}
                            onChange={(e) => handleUpdateLevel(level.id, 'role', e.target.value)}
                            placeholder="e.g., Department Manager"
                            className="border-slate-300"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-slate-700 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                          </Label>
                          <Input
                            type="email"
                            value={level.email}
                            onChange={(e) => handleUpdateLevel(level.id, 'email', e.target.value)}
                            placeholder="email@company.com"
                            className="border-slate-300"
                          />
                        </div>
                      </div>

                      {/* Notification Options */}
                      <div className="pt-4 border-t border-slate-200">
                        <Label className="text-slate-700 mb-3 block">Notification Methods</Label>
                        <div className="flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={level.notifyEmail}
                              onChange={(e) => handleUpdateLevel(level.id, 'notifyEmail', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 flex items-center gap-1">
                              <Mail className="h-4 w-4 text-blue-600" />
                              Email Notification
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={level.notifyInApp}
                              onChange={(e) => handleUpdateLevel(level.id, 'notifyInApp', e.target.checked)}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 flex items-center gap-1">
                              <Bell className="h-4 w-4 text-blue-600" />
                              In-App Notification
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Connection Arrow to Next Level */}
                    {index < escalationLevels.length - 1 && (
                      <div className="flex justify-center py-2 bg-gradient-to-b from-white to-slate-50">
                        <ChevronUp className="h-6 w-6 text-slate-400 rotate-180" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          {escalationLevels.length > 0 && (
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
              <div className="p-4">
                <h3 className="text-slate-800 mb-3">Escalation Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Total Levels</p>
                    <p className="text-2xl text-slate-800">{escalationLevels.length}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Max Time Threshold</p>
                    <p className="text-2xl text-slate-800">
                      {Math.max(...escalationLevels.map(l => l.timeThreshold))}h
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Email Notifications</p>
                    <p className="text-2xl text-slate-800">
                      {escalationLevels.filter(l => l.notifyEmail).length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
