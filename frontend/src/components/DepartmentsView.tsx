import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  Package,
  Cog,
  FlaskConical,
  Plus,
  Trash2,
  Settings,
  Filter,
  Grid3x3,
  List,
  X,
  AlertTriangle,
  Bell,
  User,
  Mail,
  Timer,
  ChevronUp,
  Save,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { EscalationConfig } from './EscalationConfig';

export const DepartmentsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
  const [escalationConfigDept, setEscalationConfigDept] = useState<any>(null);
  const [selectedDeptForConfig, setSelectedDeptForConfig] = useState<any>(null);
  const [selectedDeptForDetails, setSelectedDeptForDetails] = useState<any>(null);
  const [configFormData, setConfigFormData] = useState({
    name: '',
    description: '',
    lead: '',
    email: '',
    members: 0
  });
  const [selectedDeptForWorkflow, setSelectedDeptForWorkflow] = useState<any>(null);

  // Department-specific workflows
  const departmentWorkflows: Record<string, any> = {
    'engineering': {
      author: { name: 'John Smith', role: 'Engineering Lead', email: 'john.smith@company.com' },
      reviewer1: { name: 'Alice Johnson', role: 'Senior Engineer', email: 'alice.johnson@company.com' },
      reviewer2: { name: 'Bob Williams', role: 'Technical Architect', email: 'bob.williams@company.com' },
      approver: { name: 'Carol Davis', role: 'Engineering Manager', email: 'carol.davis@company.com' },
      managerApprover: { name: 'David Wilson', role: 'VP of Engineering', email: 'david.wilson@company.com' }
    },
    'manufacturing': {
      author: { name: 'Sarah Johnson', role: 'Manufacturing Lead', email: 'sarah.johnson@company.com' },
      reviewer1: { name: 'Mike Chen', role: 'Production Supervisor', email: 'mike.chen@company.com' },
      reviewer2: { name: 'Lisa Anderson', role: 'Quality Control Specialist', email: 'lisa.anderson@company.com' },
      approver: { name: 'Tom Martinez', role: 'Manufacturing Manager', email: 'tom.martinez@company.com' },
      managerApprover: { name: 'Jennifer Lee', role: 'VP of Operations', email: 'jennifer.lee@company.com' }
    },
    'quality-assurance': {
      author: { name: 'Michael Brown', role: 'QA Lead', email: 'michael.brown@company.com' },
      reviewer1: { name: 'Emma Wilson', role: 'QA Analyst', email: 'emma.wilson@company.com' },
      reviewer2: { name: 'James Taylor', role: 'Test Engineer', email: 'james.taylor@company.com' },
      approver: { name: 'Olivia Garcia', role: 'QA Manager', email: 'olivia.garcia@company.com' },
      managerApprover: { name: 'William Rodriguez', role: 'Director of Quality', email: 'william.rodriguez@company.com' }
    },
    'procurement': {
      author: { name: 'Emily Davis', role: 'Procurement Lead', email: 'emily.davis@company.com' },
      reviewer1: { name: 'Daniel White', role: 'Purchasing Agent', email: 'daniel.white@company.com' },
      reviewer2: { name: 'Sophia Harris', role: 'Vendor Specialist', email: 'sophia.harris@company.com' },
      approver: { name: 'Matthew Clark', role: 'Procurement Manager', email: 'matthew.clark@company.com' },
      managerApprover: { name: 'Isabella Lewis', role: 'CFO', email: 'isabella.lewis@company.com' }
    },
    'operations': {
      author: { name: 'David Wilson', role: 'Operations Lead', email: 'david.wilson@company.com' },
      reviewer1: { name: 'Ava Robinson', role: 'Operations Coordinator', email: 'ava.robinson@company.com' },
      reviewer2: { name: 'Ethan Walker', role: 'Logistics Manager', email: 'ethan.walker@company.com' },
      approver: { name: 'Mia Young', role: 'Operations Manager', email: 'mia.young@company.com' },
      managerApprover: { name: 'Alexander Hall', role: 'COO', email: 'alexander.hall@company.com' }
    },
    'research-development': {
      author: { name: 'Jennifer Martinez', role: 'R&D Lead', email: 'jennifer.martinez@company.com' },
      reviewer1: { name: 'Benjamin Allen', role: 'Research Scientist', email: 'benjamin.allen@company.com' },
      reviewer2: { name: 'Charlotte King', role: 'Innovation Specialist', email: 'charlotte.king@company.com' },
      approver: { name: 'Lucas Wright', role: 'R&D Manager', email: 'lucas.wright@company.com' },
      managerApprover: { name: 'Amelia Scott', role: 'VP of Innovation', email: 'amelia.scott@company.com' }
    }
  };

  const departments = [
    {
      id: 'engineering',
      name: 'Engineering',
      icon: Cog,
      color: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
      textColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-50',
      members: 12,
      activeRequests: 8,
      completedRequests: 45,
      description: 'Design, development, and technical specifications'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      icon: Package,
      color: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
      border: 'border-purple-200',
      textColor: 'text-purple-600',
      hoverBg: 'hover:bg-purple-50',
      members: 18,
      activeRequests: 15,
      completedRequests: 67,
      description: 'Production processes and manufacturing operations'
    },
    {
      id: 'quality-assurance',
      name: 'Quality Assurance',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      lightBg: 'bg-teal-50',
      border: 'border-teal-200',
      textColor: 'text-teal-600',
      hoverBg: 'hover:bg-teal-50',
      members: 10,
      activeRequests: 12,
      completedRequests: 89,
      description: 'Quality control, testing, and compliance'
    },
    {
      id: 'procurement',
      name: 'Procurement',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
      border: 'border-orange-200',
      textColor: 'text-orange-600',
      hoverBg: 'hover:bg-orange-50',
      members: 8,
      activeRequests: 6,
      completedRequests: 34,
      description: 'Supplier management and purchasing'
    },
    {
      id: 'operations',
      name: 'Operations',
      icon: Building2,
      color: 'from-green-500 to-green-600',
      lightBg: 'bg-green-50',
      border: 'border-green-200',
      textColor: 'text-green-600',
      hoverBg: 'hover:bg-green-50',
      members: 15,
      activeRequests: 10,
      completedRequests: 52,
      description: 'Day-to-day operations and logistics'
    },
    {
      id: 'research-development',
      name: 'Research & Development',
      icon: FlaskConical,
      color: 'from-indigo-500 to-indigo-600',
      lightBg: 'bg-indigo-50',
      border: 'border-indigo-200',
      textColor: 'text-indigo-600',
      hoverBg: 'hover:bg-indigo-50',
      members: 14,
      activeRequests: 9,
      completedRequests: 41,
      description: 'Innovation, research, and product development'
    }
  ];

  const filteredDepartments = filterDepartment === 'all' 
    ? departments 
    : departments.filter(dept => dept.id === filterDepartment);

  const handleDeleteDepartment = (deptId: string, deptName: string) => {
    if (window.confirm(`Are you sure you want to delete ${deptName} department?`)) {
      alert(`${deptName} department deleted successfully!`);
    }
  };

  const handleConfigureDepartment = (dept: any) => {
    setSelectedDeptForConfig(dept);
    setConfigFormData({
      name: dept.name,
      description: dept.description,
      lead: dept.id === 'engineering' ? 'John Smith' : dept.id === 'manufacturing' ? 'Sarah Johnson' : 'Michael Brown',
      email: `${dept.id}@company.com`,
      members: dept.members
    });
  };

  const handleViewDetails = (dept: any) => {
    setSelectedDeptForDetails(dept);
  };

  const handleSaveConfig = () => {
    alert(`✅ Configuration saved successfully for ${configFormData.name}!`);
    setSelectedDeptForConfig(null);
  };

  const handleAddDepartment = () => {
    setIsAddDialogOpen(true);
  };

  const handleSaveNewDepartment = () => {
    if (newDepartmentName.trim() === '') {
      alert('Please enter a department name');
      return;
    }
    alert(`Department \"${newDepartmentName}\" added successfully!`);
    setIsAddDialogOpen(false);
    setNewDepartmentName('');
    setNewDepartmentDescription('');
  };

  const handleEscalationConfig = (dept: any) => {
    setEscalationConfigDept(dept);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">Departments</h1>
          <p className="text-slate-600">Manage and view all department information and statistics</p>
        </div>
        <Button 
          onClick={handleAddDepartment}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Summary Section - Moved to Top */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <div className="p-6">
          <h2 className="font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">Department Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-slate-700">Total Departments</p>
              </div>
              <p className="text-3xl text-slate-800">{departments.length}</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <p className="text-sm text-slate-700">Total Members</p>
              </div>
              <p className="text-3xl text-slate-800">
                {departments.reduce((acc, dept) => acc + dept.members, 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <p className="text-sm text-slate-700">Active Requests</p>
              </div>
              <p className="text-3xl text-slate-800">
                {departments.reduce((acc, dept) => acc + dept.activeRequests, 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-green-600" />
                <p className="text-sm text-slate-700">Completed</p>
              </div>
              <p className="text-3xl text-slate-800">
                {departments.reduce((acc, dept) => acc + dept.completedRequests, 0)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters and View Toggle */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-slate-600" />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 mr-2">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`h-8 rounded-md gap-1.5 px-3 inline-flex items-center justify-center text-sm transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Grid3x3 className="h-4 w-4 mr-1" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`h-8 rounded-md gap-1.5 px-3 inline-flex items-center justify-center text-sm transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' 
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <List className="h-4 w-4 mr-1" />
              List
            </button>
          </div>
        </div>
      </Card>

      {/* Departments Grid/List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => {
            const Icon = dept.icon;
            
            return (
              <Card 
                key={dept.id}
                className={`bg-white ${dept.border} hover:shadow-lg transition-all duration-200 group`}
              >
                <div className="p-6 space-y-4">
                  {/* Header with Icon and Delete */}
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${dept.color} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 ${dept.textColor}`}>
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{dept.members}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Department Name */}
                  <div>
                    <h3 className={`text-slate-800 group-hover:${dept.textColor} transition-colors`}>
                      {dept.name}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{dept.description}</p>
                  </div>

                  {/* Statistics */}
                  <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${dept.border}`}>
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Active</span>
                      </div>
                      <p className={`text-lg ${dept.textColor}`}>{dept.activeRequests}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 mb-1">
                        <FileText className="h-3 w-3" />
                        <span className="text-xs">Completed</span>
                      </div>
                      <p className={`text-lg ${dept.textColor}`}>{dept.completedRequests}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 mt-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleConfigureDepartment(dept)}
                        className={`flex-1 py-2 px-3 rounded-lg bg-gradient-to-r ${dept.color} text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-1`}
                      >
                        <Settings className="h-3 w-3" />
                        Configure
                      </button>
                      <button 
                        onClick={() => handleViewDetails(dept)}
                        className={`flex-1 py-2 px-3 rounded-lg ${dept.lightBg} ${dept.textColor} border ${dept.border} hover:bg-gradient-to-r hover:${dept.color} hover:text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm`}
                      >
                        View Details
                      </button>
                    </div>
                    <button 
                      onClick={() => setSelectedDeptForWorkflow(dept)}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                    >
                      <GitBranch className="h-3 w-3" />
                      AI Workflow
                    </button>
                    <button 
                      onClick={() => handleEscalationConfig(dept)}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Escalation Process
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {filteredDepartments.map((dept) => {
              const Icon = dept.icon;
              
              return (
                <div 
                  key={dept.id}
                  className={`p-6 bg-white ${dept.hoverBg} transition-colors duration-200 border-l-4 ${dept.border}`}
                >
                  <div className="flex items-center justify-between gap-6">
                    {/* Left Section - Icon and Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${dept.color} shadow-lg flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`${dept.textColor} mb-1`}>{dept.name}</h3>
                        <p className="text-sm text-slate-600">{dept.description}</p>
                      </div>
                    </div>

                    {/* Middle Section - Statistics */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`flex items-center gap-2 ${dept.textColor} mb-1`}>
                          <Users className="h-4 w-4" />
                          <span className="text-xs">Members</span>
                        </div>
                        <p className={`text-lg ${dept.textColor}`}>{dept.members}</p>
                      </div>
                      <div className="text-center">
                        <div className={`flex items-center gap-2 ${dept.textColor} mb-1`}>
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">Active</span>
                        </div>
                        <p className={`text-lg ${dept.textColor}`}>{dept.activeRequests}</p>
                      </div>
                      <div className="text-center">
                        <div className={`flex items-center gap-2 ${dept.textColor} mb-1`}>
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">Completed</span>
                        </div>
                        <p className={`text-lg ${dept.textColor}`}>{dept.completedRequests}</p>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedDeptForWorkflow(dept)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <GitBranch className="h-3 w-3 mr-1" />
                        AI Workflow
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEscalationConfig(dept)}
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Escalations
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleConfigureDepartment(dept)}
                        className={`bg-gradient-to-r ${dept.color} text-white shadow-md hover:shadow-lg transition-all duration-200`}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleViewDetails(dept)}
                        className={`${dept.lightBg} ${dept.textColor} border ${dept.border} hover:bg-gradient-to-r hover:${dept.color} hover:text-white shadow-md hover:shadow-lg transition-all duration-200`}
                      >
                        View Details
                      </Button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-800">Add New Department</DialogTitle>
            <DialogDescription className="text-slate-600">
              Create a new department by filling in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dept-name" className="text-slate-700">Department Name</Label>
              <Input
                id="dept-name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="e.g., Human Resources"
                className="border-slate-300 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dept-desc" className="text-slate-700">Description</Label>
              <Input
                id="dept-desc"
                value={newDepartmentDescription}
                onChange={(e) => setNewDepartmentDescription(e.target.value)}
                placeholder="Brief description of the department"
                className="border-slate-300 text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewDepartmentName('');
                setNewDepartmentDescription('');
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewDepartment}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Escalation Configuration Modal */}
      {escalationConfigDept && (
        <EscalationConfig
          departmentName={escalationConfigDept.name}
          departmentColor={escalationConfigDept.color}
          departmentId={escalationConfigDept.id}
          onClose={() => setEscalationConfigDept(null)}
        />
      )}

      {/* Configure Department Dialog */}
      {selectedDeptForConfig && (
        <Dialog open={!!selectedDeptForConfig} onOpenChange={() => setSelectedDeptForConfig(null)}>
          <DialogContent className="bg-white border-slate-200 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedDeptForConfig.color}`}>
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-slate-800">Configure {selectedDeptForConfig.name}</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Update department settings and information
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className={`text-sm font-medium ${selectedDeptForConfig.textColor} flex items-center gap-2`}>
                  <Building2 className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="config-name" className="text-slate-700">Department Name</Label>
                    <Input
                      id="config-name"
                      value={configFormData.name}
                      onChange={(e) => setConfigFormData({ ...configFormData, name: e.target.value })}
                      className="border-slate-300 text-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-members" className="text-slate-700">Number of Members</Label>
                    <Input
                      id="config-members"
                      type="number"
                      value={configFormData.members}
                      onChange={(e) => setConfigFormData({ ...configFormData, members: parseInt(e.target.value) || 0 })}
                      className="border-slate-300 text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="config-desc" className="text-slate-700">Description</Label>
                  <textarea
                    id="config-desc"
                    value={configFormData.description}
                    onChange={(e) => setConfigFormData({ ...configFormData, description: e.target.value })}
                    className="w-full min-h-[80px] px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Department description..."
                  />
                </div>
              </div>

              {/* Department Lead */}
              <div className="space-y-4">
                <h3 className={`text-sm font-medium ${selectedDeptForConfig.textColor} flex items-center gap-2`}>
                  <User className="h-4 w-4" />
                  Department Lead
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="config-lead" className="text-slate-700">Lead Name</Label>
                    <Input
                      id="config-lead"
                      value={configFormData.lead}
                      onChange={(e) => setConfigFormData({ ...configFormData, lead: e.target.value })}
                      className="border-slate-300 text-slate-800"
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="config-email" className="text-slate-700">Email Address</Label>
                    <Input
                      id="config-email"
                      type="email"
                      value={configFormData.email}
                      onChange={(e) => setConfigFormData({ ...configFormData, email: e.target.value })}
                      className="border-slate-300 text-slate-800"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Department Statistics */}
              <div className="space-y-4">
                <h3 className={`text-sm font-medium ${selectedDeptForConfig.textColor} flex items-center gap-2`}>
                  <FileText className="h-4 w-4" />
                  Current Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${selectedDeptForConfig.lightBg} border ${selectedDeptForConfig.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`h-4 w-4 ${selectedDeptForConfig.textColor}`} />
                      <span className="text-xs text-slate-600">Active Requests</span>
                    </div>
                    <p className={`text-2xl font-medium ${selectedDeptForConfig.textColor}`}>{selectedDeptForConfig.activeRequests}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${selectedDeptForConfig.lightBg} border ${selectedDeptForConfig.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className={`h-4 w-4 ${selectedDeptForConfig.textColor}`} />
                      <span className="text-xs text-slate-600">Completed</span>
                    </div>
                    <p className={`text-2xl font-medium ${selectedDeptForConfig.textColor}`}>{selectedDeptForConfig.completedRequests}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${selectedDeptForConfig.lightBg} border ${selectedDeptForConfig.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className={`h-4 w-4 ${selectedDeptForConfig.textColor}`} />
                      <span className="text-xs text-slate-600">Team Members</span>
                    </div>
                    <p className={`text-2xl font-medium ${selectedDeptForConfig.textColor}`}>{selectedDeptForConfig.members}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setSelectedDeptForConfig(null)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveConfig}
                className={`bg-gradient-to-r ${selectedDeptForConfig.color} text-white shadow-md hover:shadow-lg transition-all duration-200`}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Details Dialog */}
      {selectedDeptForDetails && (
        <Dialog open={!!selectedDeptForDetails} onOpenChange={() => setSelectedDeptForDetails(null)}>
          <DialogContent className="bg-white border-slate-200 sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedDeptForDetails.color} shadow-lg`}>
                  {React.createElement(selectedDeptForDetails.icon, { className: 'h-6 w-6 text-white' })}
                </div>
                <div>
                  <DialogTitle className="text-slate-800 text-xl">{selectedDeptForDetails.name} Department</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Complete department information and analytics
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Overview Stats */}
              <div className="space-y-3">
                <h3 className={`text-sm font-medium ${selectedDeptForDetails.textColor}`}>Department Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${selectedDeptForDetails.lightBg} border ${selectedDeptForDetails.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className={`h-5 w-5 ${selectedDeptForDetails.textColor}`} />
                      <span className="text-sm text-slate-700 font-medium">Team Members</span>
                    </div>
                    <p className={`text-3xl font-bold ${selectedDeptForDetails.textColor}`}>{selectedDeptForDetails.members}</p>
                    <p className="text-xs text-slate-500 mt-1">Active members</p>
                  </div>
                  <div className={`p-4 rounded-lg ${selectedDeptForDetails.lightBg} border ${selectedDeptForDetails.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`h-5 w-5 ${selectedDeptForDetails.textColor}`} />
                      <span className="text-sm text-slate-700 font-medium">Active Requests</span>
                    </div>
                    <p className={`text-3xl font-bold ${selectedDeptForDetails.textColor}`}>{selectedDeptForDetails.activeRequests}</p>
                    <p className="text-xs text-slate-500 mt-1">In progress</p>
                  </div>
                  <div className={`p-4 rounded-lg ${selectedDeptForDetails.lightBg} border ${selectedDeptForDetails.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className={`h-5 w-5 ${selectedDeptForDetails.textColor}`} />
                      <span className="text-sm text-slate-700 font-medium">Completed</span>
                    </div>
                    <p className={`text-3xl font-bold ${selectedDeptForDetails.textColor}`}>{selectedDeptForDetails.completedRequests}</p>
                    <p className="text-xs text-slate-500 mt-1">Total completed</p>
                  </div>
                </div>
              </div>

              {/* Department Information */}
              <div className="space-y-3">
                <h3 className={`text-sm font-medium ${selectedDeptForDetails.textColor}`}>Department Information</h3>
                <div className={`p-4 rounded-lg ${selectedDeptForDetails.lightBg} border ${selectedDeptForDetails.border}`}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Description</p>
                      <p className="text-sm text-slate-700">{selectedDeptForDetails.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Department Lead</p>
                        <p className="text-sm text-slate-700 font-medium">
                          {selectedDeptForDetails.id === 'engineering' ? 'John Smith' : 
                           selectedDeptForDetails.id === 'manufacturing' ? 'Sarah Johnson' :
                           selectedDeptForDetails.id === 'quality-assurance' ? 'Michael Brown' :
                           selectedDeptForDetails.id === 'procurement' ? 'Emily Davis' :
                           selectedDeptForDetails.id === 'operations' ? 'David Wilson' : 'Jennifer Martinez'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Contact Email</p>
                        <p className="text-sm text-slate-700">{selectedDeptForDetails.id}@company.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <h3 className={`text-sm font-medium ${selectedDeptForDetails.textColor}`}>Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${selectedDeptForDetails.border} bg-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-700">Completion Rate</span>
                      <span className={`text-lg font-bold ${selectedDeptForDetails.textColor}`}>
                        {Math.round((selectedDeptForDetails.completedRequests / (selectedDeptForDetails.completedRequests + selectedDeptForDetails.activeRequests)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${selectedDeptForDetails.color}`}
                        style={{ width: `${Math.round((selectedDeptForDetails.completedRequests / (selectedDeptForDetails.completedRequests + selectedDeptForDetails.activeRequests)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg border ${selectedDeptForDetails.border} bg-white`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-slate-700">Avg. Response Time</span>
                      <span className={`text-lg font-bold ${selectedDeptForDetails.textColor}`}>2.4 hrs</span>
                    </div>
                    <p className="text-xs text-slate-500">Average time to first response</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className={`text-sm font-medium ${selectedDeptForDetails.textColor}`}>Recent Activity</h3>
                <div className="space-y-2">
                  {[
                    { action: 'Request REQ-2024-089 approved', time: '2 hours ago', type: 'success' },
                    { action: 'New request REQ-2024-090 submitted', time: '5 hours ago', type: 'info' },
                    { action: 'Request REQ-2024-087 completed', time: '1 day ago', type: 'success' },
                    { action: 'Team member added: Alex Thompson', time: '2 days ago', type: 'info' }
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
              <Button
                onClick={() => setSelectedDeptForDetails(null)}
                className={`bg-gradient-to-r ${selectedDeptForDetails.color} text-white shadow-md hover:shadow-lg transition-all duration-200`}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Workflow Dialog */}
      {selectedDeptForWorkflow && (
        <Dialog open={!!selectedDeptForWorkflow} onOpenChange={() => setSelectedDeptForWorkflow(null)}>
          <DialogContent className="bg-white border-slate-200 sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-slate-800 text-xl">AI Workflow - {selectedDeptForWorkflow.name}</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Department approval workflow with 5 stages
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Workflow Info Banner */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-800 mb-1">Automated Approval Process</h4>
                    <p className="text-xs text-slate-600">This AI-generated workflow ensures efficient review and approval across all department levels.</p>
                  </div>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-4">
                {departmentWorkflows[selectedDeptForWorkflow.id] && (
                  <>
                    {/* Step 1: Author */}
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500 to-purple-500 my-2"></div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Step 1</p>
                              <h4 className="font-medium text-slate-800">Author</h4>
                            </div>
                            <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">Create</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="text-sm text-slate-700 font-medium">{departmentWorkflows[selectedDeptForWorkflow.id].author.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-slate-500" />
                              <span className="text-sm text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].author.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              <span className="text-xs text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].author.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Reviewer 1 */}
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="w-0.5 h-16 bg-gradient-to-b from-purple-500 to-teal-500 my-2"></div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Step 2</p>
                              <h4 className="font-medium text-slate-800">Reviewer 1</h4>
                            </div>
                            <div className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">Review</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="text-sm text-slate-700 font-medium">{departmentWorkflows[selectedDeptForWorkflow.id].reviewer1.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-slate-500" />
                              <span className="text-sm text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].reviewer1.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              <span className="text-xs text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].reviewer1.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Reviewer 2 */}
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="w-0.5 h-16 bg-gradient-to-b from-teal-500 to-orange-500 my-2"></div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-medium text-teal-600 uppercase tracking-wide mb-1">Step 3</p>
                              <h4 className="font-medium text-slate-800">Reviewer 2</h4>
                            </div>
                            <div className="px-3 py-1 bg-teal-600 text-white text-xs rounded-full">Review</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="text-sm text-slate-700 font-medium">{departmentWorkflows[selectedDeptForWorkflow.id].reviewer2.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-slate-500" />
                              <span className="text-sm text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].reviewer2.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              <span className="text-xs text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].reviewer2.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Approver */}
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          </div>
                          <div className="w-0.5 h-16 bg-gradient-to-b from-orange-500 to-green-500 my-2"></div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-1">Step 4</p>
                              <h4 className="font-medium text-slate-800">Approver</h4>
                            </div>
                            <div className="px-3 py-1 bg-orange-600 text-white text-xs rounded-full">Approve</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="text-sm text-slate-700 font-medium">{departmentWorkflows[selectedDeptForWorkflow.id].approver.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-slate-500" />
                              <span className="text-sm text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].approver.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              <span className="text-xs text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].approver.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 5: Manager Approver */}
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">Step 5</p>
                              <h4 className="font-medium text-slate-800">Manager Approver</h4>
                            </div>
                            <div className="px-3 py-1 bg-green-600 text-white text-xs rounded-full">Final Approval</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-600" />
                              <span className="text-sm text-slate-700 font-medium">{departmentWorkflows[selectedDeptForWorkflow.id].managerApprover.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Circle className="h-3 w-3 text-slate-500" />
                              <span className="text-sm text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].managerApprover.role}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              <span className="text-xs text-slate-600">{departmentWorkflows[selectedDeptForWorkflow.id].managerApprover.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Workflow Summary */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-5">
                <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-slate-600" />
                  Workflow Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
                    <div className="text-xs text-slate-600">Author</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-purple-600 mb-1">2</div>
                    <div className="text-xs text-slate-600">Reviewers</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-orange-600 mb-1">1</div>
                    <div className="text-xs text-slate-600">Approver</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">1</div>
                    <div className="text-xs text-slate-600">Manager</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-cyan-600 mb-1">5</div>
                    <div className="text-xs text-slate-600">Total Steps</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => setSelectedDeptForWorkflow(null)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Close
              </Button>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};