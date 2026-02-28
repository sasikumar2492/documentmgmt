import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  UserCheck,
  Edit,
  Plus,
  Save,
  X,
  Search
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export const RolePermissionsManagement: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      icon: Shield,
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50',
      description: 'Full system access and control',
      userCount: 5
    },
    {
      id: 'preparator',
      name: 'Preparator',
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      description: 'Create and submit requests',
      userCount: 142
    },
    {
      id: 'reviewer',
      name: 'Reviewer',
      icon: UserCheck,
      color: 'orange',
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50',
      description: 'Review and approve/reject requests',
      userCount: 38
    },
    {
      id: 'approver',
      name: 'Approver',
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      description: 'Final approval authority',
      userCount: 63
    }
  ];

  const permissionCategories = [
    {
      category: 'Dashboard & Reports',
      permissions: [
        { id: 'view_dashboard', name: 'View Dashboard', admin: true, preparator: true, reviewer: true, approver: true },
        { id: 'view_analytics', name: 'View Analytics', admin: true, preparator: false, reviewer: true, approver: true },
        { id: 'export_reports', name: 'Export Reports', admin: true, preparator: false, reviewer: true, approver: true },
        { id: 'create_reports', name: 'Create Custom Reports', admin: true, preparator: false, reviewer: false, approver: false }
      ]
    },
    {
      category: 'Request Management',
      permissions: [
        { id: 'create_request', name: 'Create Request', admin: true, preparator: true, reviewer: false, approver: false },
        { id: 'edit_request', name: 'Edit Request', admin: true, preparator: true, reviewer: false, approver: false },
        { id: 'delete_request', name: 'Delete Request', admin: true, preparator: false, reviewer: false, approver: false },
        { id: 'view_all_requests', name: 'View All Requests', admin: true, preparator: false, reviewer: true, approver: true }
      ]
    },
    {
      category: 'Approval Workflow',
      permissions: [
        { id: 'review_requests', name: 'Review Requests', admin: true, preparator: false, reviewer: true, approver: false },
        { id: 'approve_requests', name: 'Approve Requests', admin: true, preparator: false, reviewer: true, approver: true },
        { id: 'reject_requests', name: 'Reject Requests', admin: true, preparator: false, reviewer: true, approver: false },
        { id: 'final_approval', name: 'Final Approval', admin: true, preparator: false, reviewer: false, approver: true }
      ]
    },
    {
      category: 'User Management',
      permissions: [
        { id: 'view_users', name: 'View Users', admin: true, preparator: false, reviewer: false, approver: false },
        { id: 'create_users', name: 'Create Users', admin: true, preparator: false, reviewer: false, approver: false },
        { id: 'edit_users', name: 'Edit Users', admin: true, preparator: false, reviewer: false, approver: false },
        { id: 'delete_users', name: 'Delete Users', admin: true, preparator: false, reviewer: false, approver: false }
      ]
    },
    {
      category: 'System Configuration',
      permissions: [
        { id: 'manage_departments', name: 'Manage Departments', admin: true, preparator: false, reviewer: false, approver: false },
        { id: 'manage_workflows', name: 'Manage Workflows', admin: true, preparator: false, reviewer: false, approver: false },
        { id: 'manage_sops', name: 'Manage SOPs', admin: true, preparator: false, reviewer: false, approver: false },
        { id: 'view_audit_logs', name: 'View Audit Logs', admin: true, preparator: false, reviewer: false, approver: false }
      ]
    }
  ];

  const currentRole = roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Role & Permissions Management
          </h1>
          <p className="text-slate-600 mt-1">Configure role-based access control</p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          className={`${
            isEditing 
              ? 'bg-slate-600 hover:bg-slate-700' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
          } text-white shadow-lg`}
        >
          {isEditing ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel Edit
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Permissions
            </>
          )}
        </Button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <Card 
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`cursor-pointer transition-all duration-300 border-2 ${
                isSelected 
                  ? `border-${role.color}-500 shadow-xl scale-105` 
                  : 'border-transparent hover:border-slate-200 hover:shadow-lg'
              }`}
            >
              <CardContent className={`p-4 bg-gradient-to-br ${role.bgGradient}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${role.gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white text-slate-700 border border-slate-200">
                    {role.userCount} users
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{role.name}</h3>
                <p className="text-sm text-slate-600">{role.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Permissions Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {currentRole && (
                  <>
                    <currentRole.icon className="h-6 w-6" />
                    {currentRole.name} Permissions
                  </>
                )}
              </CardTitle>
              <CardDescription>
                Configure what {currentRole?.name.toLowerCase()} users can do
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {permissionCategories.map((category, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-3 border-b">
                  <h3 className="font-semibold text-slate-900">{category.category}</h3>
                </div>
                <div className="divide-y">
                  {category.permissions.map((permission) => {
                    const hasPermission = permission[selectedRole as keyof typeof permission];
                    
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            hasPermission 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {hasPermission ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{permission.name}</p>
                            <p className="text-sm text-slate-500">Permission ID: {permission.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge 
                            className={`${
                              hasPermission 
                                ? 'bg-green-100 text-green-700 border-green-200' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {hasPermission ? 'Enabled' : 'Disabled'}
                          </Badge>
                          {isEditing && (
                            <Checkbox 
                              checked={hasPermission as boolean}
                              className="data-[state=checked]:bg-green-500"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-slate-300"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Role Card */}
      <Card className="shadow-lg border-2 border-dashed border-slate-300 hover:border-purple-400 transition-all cursor-pointer group">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-4 group-hover:scale-110 transition-transform">
            <Plus className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Create New Role</h3>
          <p className="text-sm text-slate-600 mb-4">Define a custom role with specific permissions</p>
          <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
