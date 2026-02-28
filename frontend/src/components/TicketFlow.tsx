import React, { useState } from 'react';
import {
  Ticket,
  LayoutDashboard,
  Settings,
  AlertTriangle,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  Bell,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Building2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  User,
  Calendar,
  MessageSquare,
  Paperclip,
  Tag,
  Send,
  Download,
  Edit,
  Trash2,
  XCircle,
  Timer,
  Save,
  X,
  List,
  Table,
  Upload
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface TicketFlowProps {
  onBackToHome: () => void;
  userName: string;
  userRole: string;
}

interface TicketData {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  requester: string;
  category: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  tags: string[];
  comments: number;
  attachments: number;
}

interface SLAConfig {
  id: string;
  priority: string;
  responseTime: string;
  resolutionTime: string;
  department: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  ticketCount: number;
  color: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  members: number;
  activeTickets: number;
}

export const TicketFlow: React.FC<TicketFlowProps> = ({ onBackToHome, userName, userRole }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [detailTicket, setDetailTicket] = useState<TicketData | null>(null);

  // Mock ticket data
  const tickets: TicketData[] = [
    {
      id: 'TKT-001',
      title: 'Login page not loading for mobile users',
      description: 'Users are reporting issues accessing the login page on mobile devices. The page appears blank after recent update.',
      status: 'open',
      priority: 'urgent',
      assignee: 'John Smith',
      requester: 'Sarah Johnson',
      category: 'Technical',
      department: 'IT Support',
      createdAt: '2024-01-20 09:30',
      updatedAt: '2024-01-20 10:15',
      dueDate: '2024-01-20 18:00',
      tags: ['bug', 'mobile', 'authentication'],
      comments: 5,
      attachments: 2
    },
    {
      id: 'TKT-002',
      title: 'Request for new feature: Dark mode',
      description: 'Multiple users have requested a dark mode option for better viewing experience during night hours.',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Mike Chen',
      requester: 'David Brown',
      category: 'Feature Request',
      department: 'Product',
      createdAt: '2024-01-19 14:20',
      updatedAt: '2024-01-20 08:45',
      dueDate: '2024-01-25 17:00',
      tags: ['enhancement', 'UI'],
      comments: 12,
      attachments: 1
    },
    {
      id: 'TKT-003',
      title: 'Password reset email not received',
      description: 'Customer reported not receiving password reset email after multiple attempts. Email configuration needs verification.',
      status: 'resolved',
      priority: 'high',
      assignee: 'Emily Davis',
      requester: 'Robert Wilson',
      category: 'Technical',
      department: 'IT Support',
      createdAt: '2024-01-18 11:00',
      updatedAt: '2024-01-19 16:30',
      dueDate: '2024-01-19 17:00',
      tags: ['email', 'authentication', 'resolved'],
      comments: 8,
      attachments: 0
    },
    {
      id: 'TKT-004',
      title: 'Improve search functionality performance',
      description: 'Search results are loading slowly when filtering large datasets. Need optimization for database queries.',
      status: 'open',
      priority: 'medium',
      assignee: 'Alex Turner',
      requester: 'Lisa Anderson',
      category: 'Performance',
      department: 'Engineering',
      createdAt: '2024-01-20 08:15',
      updatedAt: '2024-01-20 09:00',
      dueDate: '2024-01-22 17:00',
      tags: ['performance', 'search'],
      comments: 3,
      attachments: 1
    },
    {
      id: 'TKT-005',
      title: 'Add export to PDF functionality',
      description: 'Users need ability to export reports as PDF documents for offline viewing and sharing.',
      status: 'in-progress',
      priority: 'low',
      assignee: 'John Smith',
      requester: 'Michael Green',
      category: 'Feature Request',
      department: 'Product',
      createdAt: '2024-01-17 10:30',
      updatedAt: '2024-01-20 07:20',
      dueDate: '2024-01-30 17:00',
      tags: ['enhancement', 'export'],
      comments: 6,
      attachments: 3
    },
    {
      id: 'TKT-006',
      title: 'Dashboard charts not rendering correctly',
      description: 'Some users are experiencing issues with chart rendering on the analytics dashboard after browser update.',
      status: 'closed',
      priority: 'high',
      assignee: 'Emily Davis',
      requester: 'Jennifer Lee',
      category: 'Bug',
      department: 'Engineering',
      createdAt: '2024-01-15 13:45',
      updatedAt: '2024-01-18 15:00',
      dueDate: '2024-01-16 17:00',
      tags: ['bug', 'charts', 'resolved'],
      comments: 15,
      attachments: 5
    },
    {
      id: 'TKT-007',
      title: 'API timeout errors on production',
      description: 'Production API endpoints timing out during peak hours. Needs immediate investigation.',
      status: 'open',
      priority: 'urgent',
      assignee: 'Alex Turner',
      requester: userName,
      category: 'Technical',
      department: 'Engineering',
      createdAt: '2024-01-21 07:15',
      updatedAt: '2024-01-21 07:45',
      dueDate: '2024-01-21 12:00',
      tags: ['api', 'production', 'critical'],
      comments: 2,
      attachments: 0
    },
    {
      id: 'TKT-008',
      title: 'User permissions not working',
      description: 'Multiple users reporting permission errors when accessing certain features.',
      status: 'open',
      priority: 'urgent',
      assignee: 'John Smith',
      requester: userName,
      category: 'Security',
      department: 'IT Support',
      createdAt: '2024-01-18 14:30',
      updatedAt: '2024-01-20 16:00',
      dueDate: '2024-01-19 17:00',
      tags: ['security', 'permissions', 'overdue'],
      comments: 10,
      attachments: 1
    }
  ];

  // SLA Configurations
  const slaConfigs: SLAConfig[] = [
    { id: '1', priority: 'Urgent', responseTime: '1 hour', resolutionTime: '4 hours', department: 'All' },
    { id: '2', priority: 'High', responseTime: '2 hours', resolutionTime: '8 hours', department: 'All' },
    { id: '3', priority: 'Medium', responseTime: '4 hours', resolutionTime: '24 hours', department: 'All' },
    { id: '4', priority: 'Low', responseTime: '8 hours', resolutionTime: '48 hours', department: 'All' },
  ];

  // Categories
  const categories: Category[] = [
    { id: '1', name: 'Technical', description: 'Technical issues and bugs', ticketCount: 15, color: 'bg-blue-500' },
    { id: '2', name: 'Feature Request', description: 'New feature requests', ticketCount: 8, color: 'bg-green-500' },
    { id: '3', name: 'Bug', description: 'Software bugs and errors', ticketCount: 12, color: 'bg-red-500' },
    { id: '4', name: 'Performance', description: 'Performance related issues', ticketCount: 5, color: 'bg-yellow-500' },
    { id: '5', name: 'Security', description: 'Security concerns', ticketCount: 3, color: 'bg-purple-500' },
  ];

  // Departments
  const departments: Department[] = [
    { id: '1', name: 'IT Support', description: 'Technical support team', members: 12, activeTickets: 8 },
    { id: '2', name: 'Engineering', description: 'Software development team', members: 25, activeTickets: 15 },
    { id: '3', name: 'Product', description: 'Product management team', members: 8, activeTickets: 4 },
    { id: '4', name: 'Customer Success', description: 'Customer support team', members: 15, activeTickets: 10 },
  ];

  // Ticket trend data
  const trendData = [
    { day: '1', open: 12, progress: 8, resolved: 5 },
    { day: '2', open: 15, progress: 10, resolved: 4 },
    { day: '3', open: 13, progress: 12, resolved: 6 },
    { day: '4', open: 18, progress: 9, resolved: 7 },
    { day: '5', open: 14, progress: 11, resolved: 5 },
    { day: '6', open: 11, progress: 10, resolved: 8 },
    { day: '7', open: 7, progress: 5, resolved: 4 }
  ];

  // Priority distribution data
  const priorityData = [
    { name: 'Urgent', value: 25, color: '#ef4444' },
    { name: 'High', value: 42, color: '#f97316' },
    { name: 'Low', value: 17, color: '#3b82f6' },
    { name: 'Medium', value: 16, color: '#eab308' }
  ];

  // Department performance data
  const departmentData = [
    { name: 'IT Support', open: 8, closed: 12 },
    { name: 'Engineering', open: 15, closed: 20 },
    { name: 'Product', open: 4, closed: 6 },
    { name: 'Customer Success', open: 10, closed: 15 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-300';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  const getMyTickets = (filter: string) => {
    switch (filter) {
      case 'open':
        return tickets.filter(t => t.requester === userName && t.status === 'open');
      case 'closed':
        return tickets.filter(t => t.requester === userName && (t.status === 'closed' || t.status === 'resolved'));
      case 'overdue':
        return tickets.filter(t => t.requester === userName && t.tags.includes('overdue'));
      default:
        return tickets;
    }
  };

  const getEscalatedTickets = () => {
    return tickets.filter(t => t.priority === 'urgent' || t.tags.includes('escalated'));
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'tickets', icon: Ticket, label: 'Tickets' },
    { id: 'sla', icon: Clock, label: 'SLA Config' },
    { id: 'escalations', icon: AlertTriangle, label: 'Escalations' },
    { id: 'categories', icon: FolderKanban, label: 'Categories' },
    { id: 'departments', icon: Building2, label: 'Departments' },
  ];

  const myTicketsItems = [
    { id: 'open', icon: Ticket, label: 'My Open Tickets' },
    { id: 'closed', icon: CheckCircle, label: 'My Closed Tickets' },
    { id: 'overdue', icon: AlertTriangle, label: 'My Overdue Tickets' },
  ];

  const reportsItems = [
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'board', icon: BarChart3, label: 'Board' },
  ];

  // Render different views based on activeView
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'tickets':
        return renderTickets();
      case 'sla':
        return renderSLAConfig();
      case 'escalations':
        return renderEscalations();
      case 'categories':
        return renderCategories();
      case 'departments':
        return renderDepartments();
      case 'open':
      case 'closed':
      case 'overdue':
        return renderMyTickets(activeView);
      case 'reports':
        return renderReports();
      case 'board':
        return renderBoard();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Tickets</p>
                <p className="text-3xl font-bold text-slate-900">{tickets.length}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-slate-500">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">SLA Compliance</p>
                <p className="text-3xl font-bold text-slate-900">75%</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">3 breached</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Escalated</p>
                <p className="text-3xl font-bold text-slate-900">{getEscalatedTickets().length}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm text-slate-600 mb-1">Resolved</p>
                <p className="text-3xl font-bold text-slate-900">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">+8%</span>
              <span className="text-slate-500">from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Boxes Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-red-50 border-red-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Urgent Attention Required</p>
                  <p className="text-sm text-red-700">
                    {tickets.filter(t => t.priority === 'urgent').length} urgent tickets need immediate attention
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => setActiveView('escalations')}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-orange-900">SLA Breaches</p>
                  <p className="text-sm text-orange-700">
                    {tickets.filter(t => t.tags.includes('overdue')).length} tickets have breached their SLA
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
                onClick={() => setActiveView('sla')}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Ticket Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} minHeight={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2} name="Open" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="progress" stroke="#10b981" strokeWidth={2} name="In Progress" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="resolved" stroke="#f59e0b" strokeWidth={2} name="Resolved" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} minHeight={280}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Category */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Tickets by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280} minHeight={280}>
              <BarChart data={[
                { category: 'HVAC', count: 1 },
                { category: 'Electrical', count: 1 },
                { category: 'Maintenance', count: 1 },
                { category: 'Network', count: 1 },
                { category: 'Finance', count: 1 },
                { category: 'Plumbing', count: 1 },
                { category: 'Call', count: 1 },
                { category: 'Health & Safety', count: 1 },
                { category: 'IT Support', count: 1 },
                { category: 'Engineering', count: 1 },
                { category: 'Janitorial', count: 1 },
                { category: 'Landscaping', count: 1 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="category" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SLA Compliance Overview */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">SLA Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-slate-900 mb-2">75%</div>
                <p className="text-sm text-slate-600">Overall SLA Compliance</p>
              </div>
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">9</div>
                  <p className="text-sm text-green-700">Compliant</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-4xl font-bold text-red-600 mb-1">3</div>
                  <p className="text-sm text-red-700">Breached</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="bg-white border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
              <Button 
                variant="link" 
                className="text-blue-600 hover:text-blue-700 text-sm p-0"
                onClick={() => setActiveView('tickets')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tickets.slice(0, 3).map((ticket) => (
              <div 
                key={ticket.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <Badge variant="outline" className="font-mono text-xs">{ticket.id}</Badge>
                  <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline" className={`${getStatusColor(ticket.status)} text-xs`}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                  {ticket.tags.includes('overdue') && (
                    <Badge className="bg-red-500 text-white text-xs">SLA Breach</Badge>
                  )}
                </div>
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">{ticket.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <span>Assigned to</span>
                    <span className="font-medium text-slate-700">{ticket.assignee}</span>
                  </div>
                  <span>{ticket.createdAt}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              onClick={() => setShowNewTicketDialog(true)}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Create New Ticket</span>
            </Button>
            <Button 
              className="w-full justify-start gap-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200"
              onClick={() => setActiveView('departments')}
            >
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Manage Departments</span>
            </Button>
            <Button 
              className="w-full justify-start gap-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
              onClick={() => setActiveView('sla')}
            >
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Configure SLA</span>
            </Button>
            <Button 
              className="w-full justify-start gap-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200"
              onClick={() => setActiveView('escalations')}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Manage Escalations</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          onClick={() => setActiveView('tickets')}
        >
          View All Tickets
        </Button>
      </div>
    </div>
  );

  const renderTickets = () => {
    const filteredTickets = tickets.filter(ticket => 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">All Tickets</h2>
            <p className="text-sm text-slate-600">Manage and track all support tickets across all departments</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowNewTicketDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Create Ticket
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search tickets by ID, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle and Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{filteredTickets.length}</span> tickets
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3 gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3 gap-2"
              >
                <Table className="h-4 w-4" />
                Table
              </Button>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Tickets
            </Button>
          </div>
        </div>

        {/* Tickets Display */}
        {viewMode === 'list' ? (
          // Card/List View
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:shadow-lg transition-all border-l-4 bg-white"
                style={{
                  borderLeftColor: ticket.priority === 'urgent' ? '#ef4444' : 
                                  ticket.priority === 'high' ? '#f97316' :
                                  ticket.priority === 'medium' ? '#eab308' : '#22c55e'
                }}
                onClick={() => {
                  setDetailTicket(ticket);
                  setShowTicketDetail(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">{ticket.id}</Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status.replace('-', ' ').toUpperCase()}</span>
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">{ticket.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{ticket.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{ticket.department}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{ticket.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.comments}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-slate-900">{ticket.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-slate-900 mb-1">{ticket.title}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{ticket.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(ticket.status)} text-xs`}
                        >
                          {ticket.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge className={`${getPriorityColor(ticket.priority)} text-xs`}>
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {ticket.assignee.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm text-slate-900">{ticket.assignee}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                          {ticket.department}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">{ticket.category}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailTicket(ticket);
                              setShowTicketDetail(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle track
                            }}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSLAConfig = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">SLA Configuration</h2>
          <p className="text-sm text-slate-600">Manage service level agreements for different priorities</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Add SLA Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {slaConfigs.map((sla) => (
          <Card key={sla.id} className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getPriorityColor(sla.priority.toLowerCase() as any)}>
                      {sla.priority}
                    </Badge>
                    <Badge variant="outline">{sla.department}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Response Time</p>
                      <p className="text-lg font-semibold text-slate-900">{sla.responseTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Resolution Time</p>
                      <p className="text-lg font-semibold text-slate-900">{sla.resolutionTime}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SLA Performance Chart */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">SLA Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <BarChart data={[
              { priority: 'Urgent', met: 70, breached: 30 },
              { priority: 'High', met: 85, breached: 15 },
              { priority: 'Medium', met: 90, breached: 10 },
              { priority: 'Low', met: 95, breached: 5 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="priority" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="met" fill="#10b981" name="SLA Met" radius={[8, 8, 0, 0]} />
              <Bar dataKey="breached" fill="#ef4444" name="SLA Breached" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderEscalations = () => {
    const escalatedTickets = getEscalatedTickets();
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Escalated Tickets</h2>
            <p className="text-sm text-slate-600">Tickets requiring immediate attention</p>
          </div>
          <Badge className="bg-red-500 text-white text-lg px-4 py-2">
            {escalatedTickets.length} Escalated
          </Badge>
        </div>

        <div className="space-y-3">
          {escalatedTickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-red-500 bg-red-50"
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">{ticket.id}</Badge>
                      <Badge className="bg-red-500 text-white">URGENT</Badge>
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status.replace('-', ' ').toUpperCase()}</span>
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-1">{ticket.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Assigned to: {ticket.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3 text-red-600" />
                        <span className="text-red-600 font-semibold">Due: {ticket.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Take Action
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ticket Categories</h2>
          <p className="text-sm text-slate-600">Organize tickets by category</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center`}>
                  <FolderKanban className="h-6 w-6 text-white" />
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{category.name}</h3>
              <p className="text-sm text-slate-600 mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900">{category.ticketCount}</span>
                <span className="text-xs text-slate-500">Active Tickets</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Departments</h2>
          <p className="text-sm text-slate-600">Manage department teams and tickets</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                    <p className="text-sm text-slate-600">{dept.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Team Members</p>
                  <p className="text-xl font-bold text-slate-900">{dept.members}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Active Tickets</p>
                  <p className="text-xl font-bold text-blue-600">{dept.activeTickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Performance Chart */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} minHeight={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="open" fill="#3b82f6" name="Open Tickets" radius={[8, 8, 0, 0]} />
              <Bar dataKey="closed" fill="#10b981" name="Closed Tickets" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );

  const renderMyTickets = (filter: string) => {
    const myTickets = getMyTickets(filter);
    const title = filter === 'open' ? 'My Open Tickets' : 
                  filter === 'closed' ? 'My Closed Tickets' : 
                  'My Overdue Tickets';
    
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">Tickets submitted by you</p>
          </div>
          <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
            {myTickets.length} Tickets
          </Badge>
        </div>

        <div className="space-y-3">
          {myTickets.length === 0 ? (
            <Card className="bg-white border-slate-200">
              <CardContent className="p-12 text-center">
                <Ticket className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No tickets found</p>
              </CardContent>
            </Card>
          ) : (
            myTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="cursor-pointer hover:shadow-lg transition-all border-l-4"
                style={{
                  borderLeftColor: ticket.priority === 'urgent' ? '#ef4444' : 
                                  ticket.priority === 'high' ? '#f97316' :
                                  ticket.priority === 'medium' ? '#eab308' : '#22c55e'
                }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono text-xs">{ticket.id}</Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status.replace('-', ' ').toUpperCase()}</span>
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">{ticket.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mb-3">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Assigned to: {ticket.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {ticket.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-600">Detailed insights and performance metrics</p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <p className="text-blue-100 mb-2">Average Response Time</p>
            <p className="text-4xl font-bold">2.5h</p>
            <p className="text-sm text-blue-100 mt-2">↓ 15% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <p className="text-green-100 mb-2">Resolution Rate</p>
            <p className="text-4xl font-bold">87%</p>
            <p className="text-sm text-green-100 mt-2">↑ 8% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardContent className="p-6">
            <p className="text-orange-100 mb-2">Customer Satisfaction</p>
            <p className="text-4xl font-bold">4.6/5</p>
            <p className="text-sm text-orange-100 mt-2">↑ 0.3 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Ticket Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} minHeight={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="progress" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} minHeight={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip />
                <Bar dataKey="open" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="closed" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBoard = () => {
    const openTickets = tickets.filter(t => t.status === 'open');
    const inProgressTickets = tickets.filter(t => t.status === 'in-progress');
    const resolvedTickets = tickets.filter(t => t.status === 'resolved');
    const closedTickets = tickets.filter(t => t.status === 'closed');

    const KanbanColumn = ({ title, tickets, color }: { title: string; tickets: TicketData[]; color: string }) => (
      <div className="flex-1 min-w-[300px]">
        <div className="mb-4">
          <div className={`flex items-center justify-between p-3 ${color} rounded-lg`}>
            <h3 className="font-semibold text-white">{title}</h3>
            <Badge className="bg-white/20 text-white">{tickets.length}</Badge>
          </div>
        </div>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setSelectedTicket(ticket)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-mono text-xs">{ticket.id}</Badge>
                  <Badge className={getPriorityColor(ticket.priority)} />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2 line-clamp-2">{ticket.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{ticket.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{ticket.assignee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" />
                    <span>{ticket.comments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );

    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Kanban Board</h2>
          <p className="text-sm text-slate-600">Visualize ticket workflow</p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn title="Open" tickets={openTickets} color="bg-blue-600" />
          <KanbanColumn title="In Progress" tickets={inProgressTickets} color="bg-yellow-600" />
          <KanbanColumn title="Resolved" tickets={resolvedTickets} color="bg-green-600" />
          <KanbanColumn title="Closed" tickets={closedTickets} color="bg-gray-600" />
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard': return 'Dashboard';
      case 'tickets': return 'All Tickets';
      case 'sla': return 'SLA Configuration';
      case 'escalations': return 'Escalations';
      case 'categories': return 'Categories';
      case 'departments': return 'Departments';
      case 'open': return 'My Open Tickets';
      case 'closed': return 'My Closed Tickets';
      case 'overdue': return 'My Overdue Tickets';
      case 'reports': return 'Reports';
      case 'board': return 'Kanban Board';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className={`bg-slate-900 text-white transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          {!sidebarCollapsed && <span className="font-bold text-lg">TicketFlow</span>}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>

          {!sidebarCollapsed && (
            <>
              <div className="mt-6 px-2">
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">My Tickets</span>
                </div>
                <nav className="space-y-1">
                  {myTicketsItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeView === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-6 px-2">
                <div className="px-3 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Reports</span>
                </div>
                <nav className="space-y-1">
                  {reportsItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeView === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{getViewTitle()}</h1>
              <p className="text-sm text-slate-600">
                {activeView === 'dashboard' 
                  ? "Welcome back! Here's what's happening today." 
                  : `Manage your ${getViewTitle().toLowerCase()}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={onBackToHome}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <HelpCircle className="h-5 w-5 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Settings className="h-5 w-5 text-slate-600" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-2 ml-2">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {userName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{selectedTicket.id}</Badge>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                      {getStatusIcon(selectedTicket.status)}
                      <span className="ml-1">{selectedTicket.status.replace('-', ' ').toUpperCase()}</span>
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl">{selectedTicket.title}</DialogTitle>
                  <DialogDescription>
                    Created by {selectedTicket.requester} on {selectedTicket.createdAt}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">Comments ({selectedTicket.comments})</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <User className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">{selectedTicket.assignee}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <Tag className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">{selectedTicket.category}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <Building2 className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">{selectedTicket.department}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <Timer className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">{selectedTicket.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex items-center gap-2">
                    {selectedTicket.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Update Status
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Assign to Me
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Textarea placeholder="Add a comment..." rows={3} />
                  <div className="flex justify-end">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="h-4 w-4" />
                      Post Comment
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          JS
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">John Smith</span>
                            <span className="text-xs text-slate-500">2 hours ago</span>
                          </div>
                          <p className="text-sm text-slate-700">
                            I've started investigating this issue. Will update soon.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-3 mt-4">
                <div className="space-y-3">
                  {[
                    { action: 'Ticket created', user: selectedTicket.requester, time: selectedTicket.createdAt },
                    { action: 'Status changed to In Progress', user: selectedTicket.assignee, time: selectedTicket.updatedAt },
                    { action: 'Priority set to ' + selectedTicket.priority, user: 'System', time: selectedTicket.updatedAt },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{activity.action}</p>
                        <p className="text-xs text-slate-500">
                          by {activity.user} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>Submit a new support ticket or request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Brief description of the issue" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Detailed description of the issue or request" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                <Paperclip className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm text-slate-600">Click to upload files or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewTicketDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detailed Ticket View */}
      {showTicketDetail && detailTicket && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-slate-900">Ticket Details</h1>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5 text-slate-600" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-slate-600" />
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-slate-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{userName.substring(0, 2).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500">{userRole}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Title and Actions */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">{detailTicket.title}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-sm">{detailTicket.id}</Badge>
                  <Badge className={getPriorityColor(detailTicket.priority)}>{detailTicket.priority}</Badge>
                  <Badge variant="outline" className={getStatusColor(detailTicket.status)}>
                    {detailTicket.status}
                  </Badge>
                  <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                    {detailTicket.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  onClick={() => setShowTicketDetail(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Tickets
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Side - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 leading-relaxed">{detailTicket.description}</p>
                    
                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-4">
                      <Tag className="h-4 w-4 text-slate-400" />
                      {detailTicket.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Activity & Comments */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Activity & Comments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Comment Input */}
                    <div className="space-y-3">
                      <Textarea 
                        placeholder="Add a comment..." 
                        rows={3}
                        className="resize-none"
                      />
                      
                      {/* File Upload Area */}
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Paperclip className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-700">Attach files</p>
                            <p className="text-xs text-slate-500">Click to upload or drag and drop (Max 10MB)</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Upload className="h-4 w-4" />
                            Browse
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                          <Send className="h-4 w-4" />
                          Post Comment
                        </Button>
                      </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="h-4 w-4 text-slate-600" />
                        <h4 className="font-semibold text-slate-900 text-sm">Attachments (3)</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors group">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">error-screenshot.png</p>
                            <p className="text-xs text-slate-500">2.4 MB • Uploaded by Sarah Johnson • Jan 11, 3:45 PM</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors group">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">system-logs.pdf</p>
                            <p className="text-xs text-slate-500">1.8 MB • Uploaded by Michael Chen • Jan 11, 4:20 PM</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors group">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">technical-documentation.docx</p>
                            <p className="text-xs text-slate-500">3.2 MB • Uploaded by Sarah Johnson • Jan 11, 5:10 PM</p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments (3)
                      </h4>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">SJ</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">Sarah Johnson</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">Support Agent</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">Jan 11, 2026 3:45 PM</span>
                          </div>
                          <p className="text-sm text-slate-700">
                            I've started investigating this issue. It appears to be related to the recent Safari update.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">MC</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">Michael Chen</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">Customer</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">Jan 11, 2026 4:15 PM</span>
                          </div>
                          <p className="text-sm text-slate-700">
                            Thank you for looking into this. Do you have an estimated time for resolution?
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">SJ</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">Sarah Johnson</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">Support Agent</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">Jan 11, 2026 4:50 PM</span>
                          </div>
                          <p className="text-sm text-slate-700">
                            I've escalated this to our development team. They're working on a fix and we should have an update within 24 hours.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Ticket Details */}
              <div className="space-y-6">
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">Ticket Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status */}
                    <div>
                      <Label className="text-xs text-slate-600 uppercase mb-2 block">Status</Label>
                      <Select defaultValue={detailTicket.status}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div>
                      <Label className="text-xs text-slate-600 uppercase mb-2 block">Priority</Label>
                      <Select defaultValue={detailTicket.priority}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assigned To */}
                    <div>
                      <Label className="text-xs text-slate-600 uppercase mb-2 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Assigned To
                      </Label>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {detailTicket.assignee.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{detailTicket.assignee}</p>
                          <p className="text-xs text-slate-500">Support Agent</p>
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <Label className="text-xs text-slate-600 uppercase mb-2 block">Category</Label>
                      <Badge variant="outline" className="text-sm border-blue-200 text-blue-700 bg-blue-50 px-3 py-1">
                        {detailTicket.category}
                      </Badge>
                    </div>

                    {/* Timeline */}
                    <div>
                      <Label className="text-xs text-slate-600 uppercase mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Timeline
                      </Label>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Created:</span>
                          <span className="font-medium text-slate-900">Jan 10, 3:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Updated:</span>
                          <span className="font-medium text-slate-900">Jan 10, 7:52 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Created by:</span>
                          <span className="font-medium text-slate-900">{detailTicket.requester}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button className="w-full justify-start gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      Mark as Resolved
                    </Button>
                    <Button className="w-full justify-start gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200">
                      <AlertTriangle className="h-4 w-4" />
                      Escalate Ticket
                    </Button>
                    <Button className="w-full justify-start gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200">
                      <Trash2 className="h-4 w-4" />
                      Delete Ticket
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
