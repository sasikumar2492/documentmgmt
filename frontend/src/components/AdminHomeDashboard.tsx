import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Users, 
  FileText, 
  Activity, 
  TrendingUp, 
  Shield,
  Building2,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface AdminHomeDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminHomeDashboard: React.FC<AdminHomeDashboardProps> = ({ onNavigate }) => {
  const stats = [
    {
      title: 'Total Users',
      value: '248',
      change: '+12%',
      trend: 'up',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      title: 'Active Requests',
      value: '64',
      change: '+8%',
      trend: 'up',
      icon: FileText,
      gradient: 'from-purple-500 to-indigo-600',
      bgGradient: 'from-purple-50 to-indigo-50'
    },
    {
      title: 'Departments',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Building2,
      gradient: 'from-orange-500 to-amber-600',
      bgGradient: 'from-orange-50 to-amber-50'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '-0.3%',
      trend: 'down',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  ];

  const quickActions = [
    {
      title: 'Add New User',
      description: 'Create user account',
      icon: Users,
      color: 'blue',
      onClick: () => onNavigate('user-management')
    },
    {
      title: 'Setup Department',
      description: 'Configure departments',
      icon: Building2,
      color: 'orange',
      onClick: () => onNavigate('department-setup')
    },
    {
      title: 'Manage Roles',
      description: 'Configure permissions',
      icon: Shield,
      color: 'green',
      onClick: () => onNavigate('role-permissions')
    },
    {
      title: 'View Audit Logs',
      description: 'System activity logs',
      icon: FileText,
      color: 'purple',
      onClick: () => onNavigate('audit-logs')
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'User created',
      user: 'Sarah Johnson',
      details: 'New user account for john.doe@company.com',
      timestamp: '5 minutes ago',
      icon: Users,
      color: 'blue'
    },
    {
      id: 2,
      action: 'Department added',
      user: 'Admin',
      details: 'Production Engineering department created',
      timestamp: '15 minutes ago',
      icon: Building2,
      color: 'orange'
    },
    {
      id: 3,
      action: 'Role modified',
      user: 'Sarah Johnson',
      details: 'Updated permissions for Reviewer role',
      timestamp: '1 hour ago',
      icon: Shield,
      color: 'green'
    },
    {
      id: 4,
      action: 'Workflow updated',
      user: 'Admin',
      details: 'Modified approval workflow for Quality dept',
      timestamp: '2 hours ago',
      icon: GitBranch,
      color: 'purple'
    }
  ];

  const systemAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Pending Approvals',
      message: '8 requests awaiting final approval',
      action: 'View Requests'
    },
    {
      id: 2,
      type: 'info',
      title: 'System Update',
      message: 'New features available in v1.1.0',
      action: 'Learn More'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">System overview and management</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg">
          <BarChart3 className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={index} className="border-0 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <CardContent className={`p-6 bg-gradient-to-br ${stat.bgGradient} relative`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                      <Badge 
                        className={`${
                          stat.trend === 'up' 
                            ? 'bg-green-500/20 text-green-700 border-green-200' 
                            : 'bg-orange-500/20 text-orange-700 border-orange-200'
                        } flex items-center gap-1`}
                      >
                        <TrendIcon className="h-3 w-3" />
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colorClasses = {
                  blue: 'from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
                  orange: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700',
                  green: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
                  purple: 'from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                };
                
                return (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    className={`w-full justify-start h-auto p-4 bg-gradient-to-r ${colorClasses[action.color as keyof typeof colorClasses]} text-white shadow-md hover:shadow-lg transition-all group`}
                  >
                    <Icon className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                    <div className="text-left flex-1">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system changes and events</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                const colorClasses = {
                  blue: 'bg-blue-100 text-blue-600',
                  orange: 'bg-orange-100 text-orange-600',
                  green: 'bg-green-100 text-green-600',
                  purple: 'bg-purple-100 text-purple-600'
                };
                
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-lg ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{activity.action}</p>
                        <span className="text-xs text-slate-500">by {activity.user}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">{activity.details}</p>
                      <p className="text-xs text-slate-400 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4 border-slate-300 hover:bg-slate-50">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            System Alerts
          </CardTitle>
          <CardDescription>Important notifications and updates</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning' 
                    ? 'bg-amber-50 border-amber-500' 
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{alert.title}</h4>
                    <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`${
                        alert.type === 'warning'
                          ? 'border-amber-300 text-amber-700 hover:bg-amber-100'
                          : 'border-blue-300 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      {alert.action}
                    </Button>
                  </div>
                  {alert.type === 'warning' ? (
                    <AlertCircle className="h-5 w-5 text-amber-500 ml-2" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-blue-500 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
