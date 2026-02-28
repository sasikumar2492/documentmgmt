import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  BarChart3, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  PieChart,
  LineChart,
  Activity,
  Briefcase,
  Target,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { ViewType, ReportData, TemplateData } from '../types';
import { BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface AnalyticsReportsProps {
  reports: ReportData[];
  templates: TemplateData[];
  onNavigate: (view: ViewType) => void;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({ 
  reports, 
  templates,
  onNavigate 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedReportType, setSelectedReportType] = useState<'overview' | 'documents' | 'budget' | 'performance' | 'users'>('overview');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  // Calculate statistics
  const totalDocuments = reports.length;
  const approvedDocuments = reports.filter(r => r.status === 'approved').length;
  const pendingDocuments = reports.filter(r => r.status === 'submitted' || r.status === 'initial-review' || r.status === 'review-process').length;
  const rejectedDocuments = reports.filter(r => r.status === 'rejected').length;
  const totalTemplates = templates.length;

  // Budget data (mock - in production this would come from actual budget tracking)
  const budgetData = [
    { department: 'Engineering', allocated: 50000, spent: 38500, remaining: 11500 },
    { department: 'Quality', allocated: 35000, spent: 28900, remaining: 6100 },
    { department: 'Procurement', allocated: 45000, spent: 41200, remaining: 3800 },
    { department: 'Manufacturing', allocated: 60000, spent: 52300, remaining: 7700 },
  ];

  const totalBudget = budgetData.reduce((sum, dept) => sum + dept.allocated, 0);
  const totalSpent = budgetData.reduce((sum, dept) => sum + dept.spent, 0);
  const totalRemaining = budgetData.reduce((sum, dept) => sum + dept.remaining, 0);
  const budgetUtilization = ((totalSpent / totalBudget) * 100).toFixed(1);

  // Document status distribution
  const statusDistribution = [
    { name: 'Approved', value: approvedDocuments, color: '#10b981' },
    { name: 'Pending', value: pendingDocuments, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedDocuments, color: '#ef4444' },
  ];

  // Department-wise document count
  const departmentData = [
    { department: 'Engineering', count: reports.filter(r => r.department === 'engineering').length },
    { department: 'Quality', count: reports.filter(r => r.department === 'quality').length },
    { department: 'Procurement', count: reports.filter(r => r.department === 'procurement').length },
    { department: 'Manufacturing', count: reports.filter(r => r.department === 'manufacturing').length },
  ];

  // Timeline data (last 6 months)
  const timelineData = [
    { month: 'Jul', submitted: 12, approved: 8, rejected: 2 },
    { month: 'Aug', submitted: 15, approved: 11, rejected: 3 },
    { month: 'Sep', submitted: 18, approved: 14, rejected: 2 },
    { month: 'Oct', submitted: 22, approved: 17, rejected: 4 },
    { month: 'Nov', submitted: 20, approved: 16, rejected: 3 },
    { month: 'Dec', submitted: 25, approved: 19, rejected: 5 },
  ];

  // Performance metrics
  const avgProcessingTime = '5.2 days';
  const approvalRate = ((approvedDocuments / (totalDocuments || 1)) * 100).toFixed(1);
  const rejectionRate = ((rejectedDocuments / (totalDocuments || 1)) * 100).toFixed(1);

  // Export report function
  const handleExportReport = (type: string) => {
    alert(`Exporting ${type} report...`);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              Analytics & Reports
            </h1>
            <p className="text-slate-600 mt-2">Comprehensive insights and analytics for document management</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:border-blue-400 transition-all shadow-sm"
              >
                <Calendar className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700 capitalize">{selectedPeriod}</span>
                {showPeriodDropdown ? (
                  <ChevronUp className="h-4 w-4 text-slate-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                )}
              </button>
              
              {showPeriodDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                  {['week', 'month', 'quarter', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period as any);
                        setShowPeriodDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 first:rounded-t-lg last:rounded-b-lg capitalize"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => handleExportReport('comprehensive')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'performance', label: 'Performance', icon: Target },
            { id: 'users', label: 'Users', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedReportType(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedReportType === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Section */}
      {selectedReportType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Documents */}
            <Card className="bg-blue-50 border-blue-100 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight className="h-5 w-5" />
                    <span className="text-sm font-semibold">+12%</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{totalDocuments}</div>
                <div className="text-sm text-slate-700 mt-1 font-medium">Total Documents</div>
              </CardContent>
            </Card>

            {/* Approved Documents */}
            <Card className="bg-green-50 border-green-100 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpRight className="h-5 w-5" />
                    <span className="text-sm font-semibold">+8%</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{approvedDocuments}</div>
                <div className="text-sm text-slate-700 mt-1 font-medium">Approved</div>
              </CardContent>
            </Card>

            {/* Pending Documents */}
            <Card className="bg-orange-50 border-orange-100 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <Clock className="h-7 w-7 text-orange-600" />
                  </div>
                  <div className="flex items-center gap-1 text-orange-600">
                    <span className="text-sm font-semibold">Current</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">{pendingDocuments}</div>
                <div className="text-sm text-slate-700 mt-1 font-medium">Pending Review</div>
              </CardContent>
            </Card>

            {/* Budget Utilization */}
            <Card className="bg-purple-50 border-purple-100 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <DollarSign className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 text-purple-600">
                    <span className="text-sm font-semibold">{budgetUtilization}%</span>
                  </div>
                </div>
                <div className="text-4xl font-bold text-slate-900">${(totalSpent / 1000).toFixed(0)}K</div>
                <div className="text-sm text-slate-700 mt-1 font-medium">Budget Spent</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Timeline */}
            <Card className="bg-white shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-600" />
                  Document Submission Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[300px]">
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height={300} minHeight={300}>
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSubmitted)" name="Submitted" />
                      <Area type="monotone" dataKey="approved" stroke="#10b981" fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="bg-white shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Document Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height={300} minHeight={300}>
                    <RechartsPieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance */}
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Department-wise Document Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height={300} minHeight={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Documents" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents Section */}
      {selectedReportType === 'documents' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document Statistics */}
            <Card className="bg-white shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Document Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Documents</span>
                  <span className="text-2xl font-bold text-slate-800">{totalDocuments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Templates Available</span>
                  <span className="text-2xl font-bold text-slate-800">{totalTemplates}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Approval Rate</span>
                  <span className="text-2xl font-bold text-green-600">{approvalRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Rejection Rate</span>
                  <span className="text-2xl font-bold text-red-600">{rejectionRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Avg Processing Time</span>
                  <span className="text-2xl font-bold text-blue-600">{avgProcessingTime}</span>
                </div>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="lg:col-span-2 bg-white shadow-lg border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">Status Breakdown by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['engineering', 'quality', 'procurement', 'manufacturing'].map((dept) => {
                    const deptReports = reports.filter(r => r.department === dept);
                    const deptApproved = deptReports.filter(r => r.status === 'approved').length;
                    const deptPending = deptReports.filter(r => r.status === 'submitted' || r.status === 'initial-review').length;
                    const deptRejected = deptReports.filter(r => r.status === 'rejected').length;
                    const total = deptReports.length;

                    return (
                      <div key={dept} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700 capitalize">{dept}</span>
                          <span className="text-sm text-slate-600">{total} documents</span>
                        </div>
                        <div className="flex gap-2 h-3">
                          <div 
                            className="bg-green-500 rounded-full"
                            style={{ width: `${total > 0 ? (deptApproved / total) * 100 : 0}%` }}
                            title={`Approved: ${deptApproved}`}
                          />
                          <div 
                            className="bg-yellow-500 rounded-full"
                            style={{ width: `${total > 0 ? (deptPending / total) * 100 : 0}%` }}
                            title={`Pending: ${deptPending}`}
                          />
                          <div 
                            className="bg-red-500 rounded-full"
                            style={{ width: `${total > 0 ? (deptRejected / total) * 100 : 0}%` }}
                            title={`Rejected: ${deptRejected}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Timeline Chart */}
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Monthly Document Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height={350} minHeight={350}>
                  <RechartsLineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} name="Submitted" />
                    <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Section */}
      {selectedReportType === 'budget' && (
        <div className="space-y-6">
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">${(totalBudget / 1000).toFixed(0)}K</div>
                <div className="text-sm text-slate-600 mt-1">Total Allocated</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">${(totalSpent / 1000).toFixed(0)}K</div>
                <div className="text-sm text-slate-600 mt-1">Total Spent ({budgetUtilization}%)</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">${(totalRemaining / 1000).toFixed(0)}K</div>
                <div className="text-sm text-slate-600 mt-1">Remaining Budget</div>
              </CardContent>
            </Card>
          </div>

          {/* Budget by Department */}
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Department Budget Analysis
                </span>
                <Button
                  onClick={() => handleExportReport('budget')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height={350} minHeight={350}>
                  <BarChart data={budgetData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="spent" fill="#10b981" name="Spent" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="remaining" fill="#f59e0b" name="Remaining" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Budget Table */}
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Detailed Budget Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <th className="text-left py-3 px-4 text-white font-semibold">Department</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">Allocated</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">Spent</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">Remaining</th>
                      <th className="text-right py-3 px-4 text-white font-semibold">Utilization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetData.map((dept, index) => {
                      const utilization = ((dept.spent / dept.allocated) * 100).toFixed(1);
                      return (
                        <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-700">{dept.department}</td>
                          <td className="text-right py-3 px-4 text-slate-700">${dept.allocated.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-green-600 font-medium">${dept.spent.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-blue-600 font-medium">${dept.remaining.toLocaleString()}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              parseFloat(utilization) > 90 ? 'bg-red-100 text-red-800' :
                              parseFloat(utilization) > 75 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {utilization}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-semibold">
                      <td className="py-3 px-4 text-slate-800">Total</td>
                      <td className="text-right py-3 px-4 text-slate-800">${totalBudget.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-green-600">${totalSpent.toLocaleString()}</td>
                      <td className="text-right py-3 px-4 text-blue-600">${totalRemaining.toLocaleString()}</td>
                      <td className="text-right py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {budgetUtilization}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Section */}
      {selectedReportType === 'performance' && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{approvalRate}%</div>
                <div className="text-sm text-slate-600 mt-1">Approval Rate</div>
                <div className="mt-3 text-xs text-green-600">+3.2% from last month</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-slate-800">{avgProcessingTime}</div>
                <div className="text-sm text-slate-600 mt-1">Avg Processing Time</div>
                <div className="mt-3 text-xs text-blue-600">-0.8 days improvement</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-slate-800">94.2%</div>
                <div className="text-sm text-slate-600 mt-1">On-Time Completion</div>
                <div className="mt-3 text-xs text-orange-600">Target: 95%</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Trends */}
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height={350} minHeight={350}>
                  <RechartsLineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="approved" 
                      stroke="#10b981" 
                      strokeWidth={3} 
                      name="Approved" 
                      dot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="submitted" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      name="Submitted" 
                      dot={{ r: 6 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Section */}
      {selectedReportType === 'users' && (
        <div className="space-y-6">
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">User Activity Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">User activity reports coming soon...</p>
                <p className="text-sm text-slate-500 mt-2">This section will display user activity, engagement metrics, and collaboration statistics.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};