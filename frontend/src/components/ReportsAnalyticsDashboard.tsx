import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const ReportsAnalyticsDashboard: React.FC = () => {
  const kpiMetrics = [
    {
      title: 'Total Requests',
      value: '1,245',
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Approval Rate',
      value: '87.3%',
      change: '+3.2%',
      trend: 'up',
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    },
    {
      title: 'Avg. Processing Time',
      value: '4.8 days',
      change: '-8.1%',
      trend: 'down',
      icon: Clock,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50'
    },
    {
      title: 'Active Users',
      value: '248',
      change: '+5.7%',
      trend: 'up',
      icon: Users,
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50'
    }
  ];

  const departmentStats = [
    { name: 'Quality Assurance', requests: 342, approved: 298, rejected: 44, pending: 12, color: 'purple' },
    { name: 'Production Engineering', requests: 287, approved: 251, rejected: 36, pending: 8, color: 'blue' },
    { name: 'Supply Chain', requests: 198, approved: 175, rejected: 23, pending: 5, color: 'green' },
    { name: 'R&D', requests: 156, approved: 132, rejected: 24, pending: 7, color: 'orange' }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Monthly Performance Report',
      type: 'Performance',
      period: 'January 2024',
      generatedBy: 'System',
      date: '2024-01-25',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Department Efficiency Analysis',
      type: 'Efficiency',
      period: 'Q4 2023',
      generatedBy: 'Sarah Johnson',
      date: '2024-01-20',
      size: '1.8 MB'
    },
    {
      id: 3,
      name: 'User Activity Report',
      type: 'Activity',
      period: 'Last 30 Days',
      generatedBy: 'System',
      date: '2024-01-18',
      size: '956 KB'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-slate-600 mt-1">System performance insights and reporting</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-300">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
          
          return (
            <Card key={index} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className={`p-6 bg-gradient-to-br ${metric.bgGradient} relative`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">{metric.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-slate-900">{metric.value}</h3>
                      <Badge 
                        className={`${
                          metric.trend === 'up' 
                            ? 'bg-green-500/20 text-green-700 border-green-200' 
                            : 'bg-blue-500/20 text-blue-700 border-blue-200'
                        } flex items-center gap-1`}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Department Performance
            </CardTitle>
            <CardDescription>Request statistics by department</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {departmentStats.map((dept, idx) => {
                const approvalRate = ((dept.approved / dept.requests) * 100).toFixed(1);
                const colors = {
                  purple: 'bg-purple-500',
                  blue: 'bg-blue-500',
                  green: 'bg-green-500',
                  orange: 'bg-orange-500'
                };
                
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{dept.name}</span>
                      <span className="text-sm text-slate-600">{dept.requests} requests</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full ${colors[dept.color as keyof typeof colors]} rounded-full transition-all duration-500`}
                        style={{ width: `${approvalRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {dept.approved}
                        </span>
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          {dept.rejected}
                        </span>
                        <span className="text-orange-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dept.pending}
                        </span>
                      </div>
                      <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                        {approvalRate}% approved
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Request Status Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              Request Status Distribution
            </CardTitle>
            <CardDescription>Overview of all request statuses</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Approved</p>
                    <p className="text-sm text-slate-600">Successfully approved</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-700">856</p>
                  <p className="text-sm text-green-600">68.7%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Pending</p>
                    <p className="text-sm text-slate-600">Awaiting review</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-700">262</p>
                  <p className="text-sm text-orange-600">21.0%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Rejected</p>
                    <p className="text-sm text-slate-600">Not approved</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-700">127</p>
                  <p className="text-sm text-red-600">10.3%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Generated Reports
              </CardTitle>
              <CardDescription>Recently generated analytics reports</CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate New Report
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div 
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{report.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                        {report.type}
                      </Badge>
                      <span>{report.period}</span>
                      <span>•</span>
                      <span>Generated: {report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  className="border-slate-300 hover:bg-slate-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
