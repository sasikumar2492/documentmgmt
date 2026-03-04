import React from 'react';
import { Users, UserPlus, Edit, Trash2, Shield, Search, Filter, Mail, Phone, Calendar, CheckCircle, XCircle, Download, Upload, FileText, ArrowLeft, Plus, Pencil, MapPin, FileSignature } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { MultiSelectLocations } from './MultiSelectLocations';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  department: string;
  status: 'active' | 'inactive';
  joinDate: string;
  permissions: string[];
  locations?: string[];
  signatureUrl?: string;
}

interface Role {
  id: string;
  name: string;
  permissionCount: number;
  description: string;
  color: string;
}

interface UserManagementProps {
  onNavigate?: (view: string) => void;
}

const DEPARTMENTS = [
  { id: 'engineering', name: 'Engineering' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'quality', name: 'Quality Assurance' },
  { id: 'procurement', name: 'Procurement' },
  { id: 'operations', name: 'Operations' },
  { id: 'research', name: 'Research & Development' },
];

const LOCATIONS = [
  // Saudi Arabia - Main Cities
  { id: 'riyadh-central', name: 'Riyadh - Central District' },
  { id: 'riyadh-north', name: 'Riyadh - North District' },
  { id: 'riyadh-east', name: 'Riyadh - East District' },
  { id: 'riyadh-west', name: 'Riyadh - West District' },
  { id: 'riyadh-south', name: 'Riyadh - South District' },
  { id: 'jeddah', name: 'Jeddah, Saudi Arabia' },
  { id: 'dammam', name: 'Dammam, Saudi Arabia' },
  { id: 'makkah', name: 'Makkah, Saudi Arabia' },
  { id: 'madinah', name: 'Madinah, Saudi Arabia' },
  { id: 'khobar', name: 'Khobar, Saudi Arabia' },
  { id: 'dhahran', name: 'Dhahran, Saudi Arabia' },
  { id: 'jubail', name: 'Jubail, Saudi Arabia' },
  { id: 'yanbu', name: 'Yanbu, Saudi Arabia' },
  { id: 'tabuk', name: 'Tabuk, Saudi Arabia' },
  { id: 'khamis-mushait', name: 'Khamis Mushait, Saudi Arabia' },
];

const ROLES_CONFIG: Role[] = [
  { id: 'admin', name: 'Administrator', permissionCount: 32, description: 'Full system access', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'manager', name: 'Department Manager', permissionCount: 20, description: 'Manage department workflows', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { id: 'user', name: 'Standard User', permissionCount: 8, description: 'Basic user access', color: 'bg-green-100 text-green-700 border-green-300' },
  { id: 'viewer', name: 'Viewer', permissionCount: 5, description: 'Read-only access', color: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const PERMISSIONS = [
  // Templates Management
  { id: 'upload_templates', name: 'Upload Templates', category: 'Templates' },
  { id: 'view_templates', name: 'View Templates', category: 'Templates' },
  { id: 'delete_templates', name: 'Delete Templates', category: 'Templates' },
  { id: 'download_templates', name: 'Download Templates', category: 'Templates' },
  
  // Request Management
  { id: 'raise_request', name: 'Raise Request', category: 'Requests' },
  { id: 'view_requests', name: 'View Requests', category: 'Requests' },
  { id: 'approve_reject_requests', name: 'Approve/Reject Requests', category: 'Requests' },
  { id: 'edit_requests', name: 'Edit Requests', category: 'Requests' },
  { id: 'delete_requests', name: 'Delete Requests', category: 'Requests' },
  
  // Reports & Analytics
  { id: 'view_reports', name: 'View Reports', category: 'Reports' },
  { id: 'generate_reports', name: 'Generate Reports', category: 'Reports' },
  { id: 'export_reports', name: 'Export Reports', category: 'Reports' },
  { id: 'download_reports', name: 'Download Reports', category: 'Reports' },
  
  // Document Management
  { id: 'view_documents', name: 'View Documents', category: 'Documents' },
  { id: 'upload_documents', name: 'Upload Documents', category: 'Documents' },
  { id: 'delete_documents', name: 'Delete Documents', category: 'Documents' },
  { id: 'manage_documents', name: 'Manage All Documents', category: 'Documents' },
  
  // Workflow Management
  { id: 'view_workflows', name: 'View Workflows', category: 'Workflows' },
  { id: 'configure_workflows', name: 'Configure Workflows', category: 'Workflows' },
  { id: 'manage_workflow_steps', name: 'Manage Workflow Steps', category: 'Workflows' },
  { id: 'assign_workflow_tasks', name: 'Assign Workflow Tasks', category: 'Workflows' },
  
  // User Management
  { id: 'view_users', name: 'View Users', category: 'User Management' },
  { id: 'add_users', name: 'Add Users', category: 'User Management' },
  { id: 'edit_users', name: 'Edit Users', category: 'User Management' },
  { id: 'delete_users', name: 'Delete Users', category: 'User Management' },
  { id: 'manage_roles', name: 'Manage Roles & Permissions', category: 'User Management' },
  
  // System Settings
  { id: 'system_settings', name: 'System Settings', category: 'System' },
  { id: 'department_settings', name: 'Department Settings', category: 'System' },
  { id: 'notification_settings', name: 'Notification Settings', category: 'System' },
  { id: 'email_configuration', name: 'Email Configuration', category: 'System' },
];

const DEFAULT_PERMISSIONS_BY_ROLE = {
  admin: PERMISSIONS.map(p => p.id),
  manager: [
    'upload_templates', 'view_templates', 'download_templates',
    'raise_request', 'view_requests', 'approve_reject_requests', 'edit_requests',
    'view_reports', 'generate_reports', 'export_reports', 'download_reports',
    'view_documents', 'upload_documents', 'manage_documents',
    'view_workflows', 'configure_workflows', 'manage_workflow_steps', 'assign_workflow_tasks',
    'view_users', 'department_settings'
  ],
  user: [
    'view_templates', 'download_templates',
    'raise_request', 'view_requests',
    'view_reports', 'download_reports',
    'view_documents', 'upload_documents'
  ],
  viewer: [
    'view_templates',
    'view_requests',
    'view_reports',
    'view_documents',
    'view_workflows'
  ],
};

export const UserManagement: React.FC<UserManagementProps> = ({ onNavigate }) => {
  const [activeView, setActiveView] = React.useState<'main' | 'view-users' | 'manage-roles'>('main');
  const [users, setUsers] = React.useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 234 567 8900',
      role: 'admin',
      department: 'engineering',
      status: 'active',
      joinDate: '2024-01-15',
      permissions: DEFAULT_PERMISSIONS_BY_ROLE.admin,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 234 567 8901',
      role: 'manager',
      department: 'quality',
      status: 'active',
      joinDate: '2024-02-20',
      permissions: DEFAULT_PERMISSIONS_BY_ROLE.manager,
    },
    {
      id: '3',
      name: 'Robert Johnson',
      email: 'robert.j@company.com',
      phone: '+1 234 567 8902',
      role: 'user',
      department: 'manufacturing',
      status: 'active',
      joinDate: '2024-03-10',
      permissions: DEFAULT_PERMISSIONS_BY_ROLE.user,
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.w@company.com',
      phone: '+1 234 567 8903',
      role: 'viewer',
      department: 'procurement',
      status: 'inactive',
      joinDate: '2024-04-05',
      permissions: DEFAULT_PERMISSIONS_BY_ROLE.viewer,
    },
  ]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('all');
  const [filterDepartment, setFilterDepartment] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  
  // Role management states
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>('admin');
  const [rolePermissions, setRolePermissions] = React.useState<string[]>(DEFAULT_PERMISSIONS_BY_ROLE.admin);
  const [configureDialogOpen, setConfigureDialogOpen] = React.useState(false);
  const [selectedRoleForConfig, setSelectedRoleForConfig] = React.useState<Role | null>(null);
  
  // Dialog states
  const [addUserDialogOpen, setAddUserDialogOpen] = React.useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = React.useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>([]);
  const [signatureFile, setSignatureFile] = React.useState<File | null>(null);
  
  // Form states
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'user' as User['role'],
    department: '',
    status: 'active' as User['status'],
  });

  const [userPermissions, setUserPermissions] = React.useState<string[]>([]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;

  const handleAddUser = () => {
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department,
      status: formData.status,
      joinDate: new Date().toISOString().split('T')[0],
      permissions: DEFAULT_PERMISSIONS_BY_ROLE[formData.role],
    };
    
    setUsers([...users, newUser]);
    setAddUserDialogOpen(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(user => 
      user.id === selectedUser.id
        ? { ...user, ...formData }
        : user
    ));
    
    setEditUserDialogOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleUpdatePermissions = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(user =>
      user.id === selectedUser.id
        ? { ...user, permissions: userPermissions }
        : user
    ));
    
    setPermissionsDialogOpen(false);
    setSelectedUser(null);
    setUserPermissions([]);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      status: user.status,
    });
    setEditUserDialogOpen(true);
  };

  const openPermissionsDialog = (user: User) => {
    setSelectedUser(user);
    setUserPermissions(user.permissions);
    setPermissionsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      department: '',
      status: 'active',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    return ROLES_CONFIG.find(r => r.id === role)?.color || 'bg-slate-100 text-slate-700';
  };

  const togglePermission = (permissionId: string) => {
    if (userPermissions.includes(permissionId)) {
      setUserPermissions(userPermissions.filter(p => p !== permissionId));
    } else {
      setUserPermissions([...userPermissions, permissionId]);
    }
  };

  const toggleRolePermission = (permissionId: string) => {
    if (rolePermissions.includes(permissionId)) {
      setRolePermissions(rolePermissions.filter(p => p !== permissionId));
    } else {
      setRolePermissions([...rolePermissions, permissionId]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleBulkUpload = () => {
    if (selectedFile) {
      alert(`Uploading ${selectedFile.name}... (Feature in development)`);
      setSelectedFile(null);
    }
  };

  const handleDownloadTemplate = () => {
    alert('Downloading CSV template... (Feature in development)');
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const permissions = DEFAULT_PERMISSIONS_BY_ROLE[roleId as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE];
    setRolePermissions(permissions || []);
  };

  const saveRolePermissions = () => {
    alert('Role permissions updated successfully!');
    setConfigureDialogOpen(false);
  };

  const handleConfigureRole = (role: Role) => {
    setSelectedRoleForConfig(role);
    const permissions = DEFAULT_PERMISSIONS_BY_ROLE[role.id as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE];
    setRolePermissions(permissions || []);
    setConfigureDialogOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      alert(`Role ${roleId} deleted (Feature in development)`);
    }
  };

  // Group permissions by category - memoized to prevent re-calculation
  const groupedPermissions = React.useMemo(() => {
    return PERMISSIONS.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, typeof PERMISSIONS>);
  }, []);

  // Main View
  if (activeView === 'main') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="mb-2 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">User Management</h1>
          <p className="text-slate-600">
            Manage users, roles, and permissions across the system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management Card */}
          <Card className="bg-white border-l-[6px] border-l-emerald-500 border border-slate-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-base text-slate-600 mb-2 font-medium">User Management</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">{totalUsers}</p>
                  <p className="text-sm text-slate-500 font-medium">Total users in system</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Users className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-semibold">{activeUsers} Active Users</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              <Button
                onClick={() => setAddUserDialogOpen(true)}
                className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg h-11 transition-all"
              >
                <UserPlus className="h-5 w-5 mr-3" />
                <span className="font-medium">Add New User</span>
              </Button>
              
              <Button
                onClick={() => setActiveView('view-users')}
                className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg h-11 transition-all"
              >
                <Users className="h-5 w-5 mr-3" />
                <span className="font-medium">View All Users</span>
              </Button>

              <div className="pt-4 border-t border-slate-200 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-800 text-sm">Bulk Upload Users</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-xs h-8"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Template
                  </Button>
                </div>
                
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:border-teal-400 transition-colors">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <FileText className="h-6 w-6 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700 mb-3">CSV, XLSX, XLS</p>
                      <input
                        type="file"
                        id="bulk-upload"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => document.getElementById('bulk-upload')?.click()}
                        className="bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md hover:shadow-lg transition-all font-medium text-sm h-9"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                      {selectedFile && (
                        <p className="text-xs text-slate-700 mt-2 font-semibold">
                          📄 {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedFile && (
                  <Button
                    onClick={handleBulkUpload}
                    className="w-full mt-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg h-10 transition-all font-medium text-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Users Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Management Card */}
          <Card className="bg-white border-l-[6px] border-l-blue-500 border border-slate-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-base text-slate-600 mb-2 font-medium">Role Management</p>
                  <p className="text-4xl font-bold text-slate-900 mb-1">{ROLES_CONFIG.length}</p>
                  <p className="text-sm text-slate-500 font-medium">Roles configured</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="h-7 w-7 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-semibold">Permission sets active</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              {ROLES_CONFIG.map((role, index) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      index === 0 ? 'bg-purple-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-green-500' :
                      'bg-slate-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm leading-tight">{role.name}</p>
                      <p className="text-xs text-slate-600 leading-tight mt-0.5">{role.description}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    index === 0 ? 'bg-purple-100 text-purple-700 border-purple-300' :
                    index === 1 ? 'bg-blue-100 text-blue-700 border-blue-300' :
                    index === 2 ? 'bg-green-100 text-green-700 border-green-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  } font-bold px-2.5 py-1 text-xs whitespace-nowrap flex-shrink-0 ml-2`}>
                    {role.permissionCount}
                  </Badge>
                </div>
              ))}

              <Button
                onClick={() => setActiveView('manage-roles')}
                className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg h-11 mt-4 transition-all font-medium text-sm"
              >
                <Shield className="h-5 w-5 mr-3" />
                <span className="font-medium">Manage Roles & Permissions</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add User Dialog */}
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Add New User</DialogTitle>
              <DialogDescription className="text-slate-600">
                Create a new user account with role and permissions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name" className="text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@company.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-slate-700">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_CONFIG.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department" className="text-slate-700">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-slate-700">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as User['status'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Locations Multi-Select */}
              <div>
                <Label className="text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Locations (Multi-Select)
                </Label>
                <div className="mt-1">
                  <MultiSelectLocations 
                    locations={LOCATIONS} 
                    selectedLocations={selectedLocations}
                    onChange={setSelectedLocations}
                  />
                </div>
              </div>

              {/* Upload Signature */}
              <div>
                <Label className="text-slate-700 flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-purple-600" />
                  Upload Signature
                </Label>
                <div className="mt-1">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center bg-slate-50 hover:border-indigo-400 transition-colors">
                    {signatureFile ? (
                      <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileSignature className="h-5 w-5 text-indigo-600" />
                          <span className="text-sm text-indigo-700 font-medium">{signatureFile.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSignatureFile(null)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <FileSignature className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-xs text-slate-600 mb-2">PNG, JPG, PDF (Max 5MB)</p>
                        <input
                          type="file"
                          id="signature-upload"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSignatureFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          onClick={() => document.getElementById('signature-upload')?.click()}
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all text-xs"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Choose File
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={() => setAddUserDialogOpen(false)} className="bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700 shadow-md hover:shadow-lg transition-all">
                Cancel
              </Button>
              <Button 
                onClick={handleAddUser}
                disabled={!formData.name || !formData.email || !formData.department}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Edit User</DialogTitle>
              <DialogDescription className="text-slate-600">
                Update user information and settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-name" className="text-slate-700">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-email" className="text-slate-700">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone" className="text-slate-700">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-role" className="text-slate-700">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_CONFIG.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-department" className="text-slate-700">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-status" className="text-slate-700">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as User['status'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={() => setEditUserDialogOpen(false)} className="bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700 shadow-md hover:shadow-lg transition-all">
                Cancel
              </Button>
              <Button 
                onClick={handleEditUser}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Manage Permissions</DialogTitle>
              <DialogDescription className="text-slate-600">
                Configure access permissions for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {permissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                        <Checkbox
                          id={permission.id}
                          checked={userPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <Label
                          htmlFor={permission.id}
                          className="flex-1 cursor-pointer text-slate-700"
                        >
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={() => setPermissionsDialogOpen(false)} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePermissions}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Update Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // View All Users Screen
  if (activeView === 'view-users') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Button
            onClick={() => setActiveView('main')}
            className="mb-4 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Management
          </Button>
          <h1 className="mb-2 font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">All Users</h1>
          <p className="text-slate-600">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES_CONFIG.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-md">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50">
                <TableHead className="text-slate-700 font-bold">Name</TableHead>
                <TableHead className="text-slate-700 font-bold">Email</TableHead>
                <TableHead className="text-slate-700 font-bold">Role</TableHead>
                <TableHead className="text-slate-700 font-bold">Department</TableHead>
                <TableHead className="text-slate-700 font-bold">Status</TableHead>
                <TableHead className="text-right text-slate-700 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-800">{user.name}</TableCell>
                    <TableCell className="text-slate-700">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {ROLES_CONFIG.find(r => r.id === user.role)?.name || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {DEPARTMENTS.find(d => d.id === user.department)?.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={user.status === 'active' 
                        ? 'bg-green-100 text-green-700 border-green-300' 
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                      }>
                        {user.status === 'active' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPermissionsDialog(user)}
                          title="Manage Permissions"
                          className="border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          title="Edit User"
                          className="border-indigo-500 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
                          className="border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Edit User</DialogTitle>
              <DialogDescription className="text-slate-600">
                Update user information and settings.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-name" className="text-slate-700">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-email" className="text-slate-700">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-phone" className="text-slate-700">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="edit-role" className="text-slate-700">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_CONFIG.map(role => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-department" className="text-slate-700">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-status" className="text-slate-700">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value as User['status'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={() => setEditUserDialogOpen(false)} className="bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700 shadow-md hover:shadow-lg transition-all">
                Cancel
              </Button>
              <Button 
                onClick={handleEditUser}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permissions Dialog */}
        <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Manage Permissions</DialogTitle>
              <DialogDescription className="text-slate-600">
                Configure access permissions for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {permissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                        <Checkbox
                          id={permission.id}
                          checked={userPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <Label
                          htmlFor={permission.id}
                          className="flex-1 cursor-pointer text-slate-700"
                        >
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-6">
              <Button onClick={() => setPermissionsDialogOpen(false)} className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all">
                Cancel
              </Button>
              <Button 
                onClick={handleUpdatePermissions}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <Shield className="h-4 w-4" />
                Update Permissions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Manage Roles & Permissions Screen
  if (activeView === 'manage-roles') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <Button
          onClick={() => setActiveView('main')}
          variant="ghost"
          className="mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Administration
        </Button>

        {/* Header Section */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">Manage Roles</h1>
                <p className="text-slate-600 text-sm">View, create, and configure user roles and permissions</p>
              </div>
            </div>
            <Button
              onClick={() => alert('Add New Role (Feature in development)')}
              className="bg-teal-500 text-white hover:bg-teal-600 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Role
            </Button>
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {ROLES_CONFIG.map((role) => {
            const rolePermissions = DEFAULT_PERMISSIONS_BY_ROLE[role.id as keyof typeof DEFAULT_PERMISSIONS_BY_ROLE] || [];
            
            return (
              <div key={role.id} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-slate-900 font-bold">{role.name}</h2>
                      <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                        {role.permissionCount} permissions
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm">{role.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleConfigureRole(role)}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Permissions Tags */}
                <div className="flex flex-wrap gap-2">
                  {PERMISSIONS.filter(p => rolePermissions.includes(p.id)).map((permission) => (
                    <Badge
                      key={permission.id}
                      className="bg-slate-100 text-slate-700 border border-slate-200 font-normal px-3 py-1"
                    >
                      {permission.name}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Configure Role Dialog */}
        <Dialog open={configureDialogOpen} onOpenChange={setConfigureDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-slate-800">
                Configure {selectedRoleForConfig?.name}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Select permissions for this role
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-bold text-slate-800 border-b-2 border-blue-200 pb-2 text-base">
                    {category}
                  </h3>
                  <div className="space-y-2 pl-2">
                    {permissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-blue-200 transition-all">
                        <Checkbox
                          id={`role-config-${permission.id}`}
                          checked={rolePermissions.includes(permission.id)}
                          onCheckedChange={() => toggleRolePermission(permission.id)}
                          className="border-2"
                        />
                        <Label
                          htmlFor={`role-config-${permission.id}`}
                          className="flex-1 cursor-pointer text-slate-700 font-medium"
                        >
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="mt-6">
              <Button 
                onClick={() => setConfigureDialogOpen(false)}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white hover:from-slate-600 hover:to-slate-700 shadow-md hover:shadow-lg transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={saveRolePermissions}
                className="bg-teal-500 text-white hover:bg-teal-600 shadow-md hover:shadow-lg"
              >
                <Shield className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return null;
};