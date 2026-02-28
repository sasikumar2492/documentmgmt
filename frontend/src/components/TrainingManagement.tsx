import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  FileCheck,
  Send,
  Check,
  X,
  TableIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { ReportData } from '../types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';

interface TrainingRecord {
  id: string;
  trainingName: string;
  documentId: string;
  documentName: string;
  department: string;
  departments?: string[]; // Support multiple departments
  trainee: string;
  trainer: string;
  scheduledDate: string;
  completionDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  score?: number;
  attendance: boolean;
  duration: string;
  category: string;
}

interface TrainingManagementProps {
  trainingRecords?: TrainingRecord[];
  publishedDocuments?: ReportData[];
}

export const TrainingManagement: React.FC<TrainingManagementProps> = ({ 
  trainingRecords = [], 
  publishedDocuments = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'published' | 'scheduled'>('published');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'trainingName' | 'scheduledDate' | 'status' | 'fileName' | 'uploadDate'>('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [addTrainingDialogOpen, setAddTrainingDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table'); // Add view mode state
  
  // Create Training Dialog State
  const [createTrainingDialogOpen, setCreateTrainingDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ReportData | null>(null);
  const [trainingDepartments, setTrainingDepartments] = useState<string[]>([]); // Changed to array
  const [trainingStartDate, setTrainingStartDate] = useState('');
  const [trainingEndDate, setTrainingEndDate] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  
  // View Training Dialog State
  const [viewTrainingDialogOpen, setViewTrainingDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<TrainingRecord | null>(null);
  
  // Local state for managing trainings list
  const [localTrainings, setLocalTrainings] = useState<TrainingRecord[]>([]);
  
  // Calendar view state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock training data - merged with passed training records
  const mockTrainings: TrainingRecord[] = [
    {
      id: 'train_1',
      trainingName: 'Document Control Procedures',
      documentId: 'DOC-001',
      documentName: 'Quality Management System',
      department: 'Quality Assurance',
      trainee: 'John Smith',
      trainer: 'Sarah Manager',
      scheduledDate: '2025-01-28',
      completionDate: '2025-01-28',
      status: 'completed',
      score: 95,
      attendance: true,
      duration: '2 hours',
      category: 'Quality'
    },
    {
      id: 'train_2',
      trainingName: 'Safety Protocols Update',
      documentId: 'DOC-002',
      documentName: 'Safety Guidelines v2.1',
      department: 'Manufacturing',
      trainee: 'Mike Johnson',
      trainer: 'Sarah Manager',
      scheduledDate: '2025-01-30',
      status: 'scheduled',
      attendance: false,
      duration: '3 hours',
      category: 'Safety'
    },
    {
      id: 'train_3',
      trainingName: 'ISO 9001 Certification',
      documentId: 'DOC-003',
      documentName: 'ISO Standards Handbook',
      department: 'Engineering',
      trainee: 'Emily Davis',
      trainer: 'Sarah Manager',
      scheduledDate: '2025-01-29',
      status: 'in-progress',
      attendance: true,
      duration: '4 hours',
      category: 'Compliance'
    },
    {
      id: 'train_4',
      trainingName: 'Supply Chain Best Practices',
      documentId: 'DOC-004',
      documentName: 'SCM Procedures Manual',
      department: 'Supply Chain',
      trainee: 'David Wilson',
      trainer: 'Sarah Manager',
      scheduledDate: '2025-01-25',
      status: 'overdue',
      attendance: false,
      duration: '2 hours',
      category: 'Operations'
    },
    {
      id: 'train_5',
      trainingName: 'Quality Inspection Methods',
      documentId: 'DOC-005',
      documentName: 'Inspection Protocol v3.0',
      department: 'Quality Assurance',
      trainee: 'Lisa Chen',
      trainer: 'Sarah Manager',
      scheduledDate: '2025-01-27',
      completionDate: '2025-01-27',
      status: 'completed',
      score: 88,
      attendance: true,
      duration: '3 hours',
      category: 'Quality'
    }
  ];

  // Combine mock data with passed training records AND local trainings
  // localTrainings first (newest), then passed records, then mock data
  const trainings = [...localTrainings, ...trainingRecords, ...mockTrainings];

  const departments = Array.from(new Set([
    ...trainings.map(t => t.department),
    ...publishedDocuments.map(d => d.department).filter(Boolean)
  ] as string[]));

  // Filter published documents
  const filteredPublishedDocs = publishedDocuments
    .filter(doc => {
      const matchesSearch =
        doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.department?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || doc.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      if (sortField === 'fileName') {
        return sortOrder === 'asc' 
          ? a.fileName.localeCompare(b.fileName)
          : b.fileName.localeCompare(a.fileName);
      } else if (sortField === 'uploadDate') {
        return sortOrder === 'asc'
          ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      return 0;
    });

  // Filter and sort trainings
  const filteredTrainings = trainings
    .filter(training => {
      const matchesSearch =
        training.trainingName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.trainee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        training.documentName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || training.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || training.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'trainingName') {
        comparison = a.trainingName.localeCompare(b.trainingName);
      } else if (sortField === 'scheduledDate') {
        comparison = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { label: 'Completed', className: 'bg-green-500 text-white' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-500 text-white' },
      'scheduled': { label: 'Scheduled', className: 'bg-yellow-500 text-white' },
      'overdue': { label: 'Overdue', className: 'bg-red-500 text-white' },
      'cancelled': { label: 'Cancelled', className: 'bg-gray-500 text-white' },
      'published': { label: 'Published', className: 'bg-purple-500 text-white' },
      'approved': { label: 'Approved', className: 'bg-green-500 text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;

    return (
      <Badge className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const toggleSort = (field: 'trainingName' | 'scheduledDate' | 'status' | 'fileName' | 'uploadDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Calculate statistics
  const stats = {
    totalPublished: publishedDocuments.length,
    total: trainings.length,
    completed: trainings.filter(t => t.status === 'completed').length,
    inProgress: trainings.filter(t => t.status === 'in-progress').length,
    scheduled: trainings.filter(t => t.status === 'scheduled').length,
    overdue: trainings.filter(t => t.status === 'overdue').length,
    avgScore: Math.round(
      trainings.filter(t => t.score).reduce((sum, t) => sum + (t.score || 0), 0) /
      trainings.filter(t => t.score).length
    ) || 0
  };

  const handleAddTraining = () => {
    setAddTrainingDialogOpen(true);
  };

  const handleSaveTraining = () => {
    toast.success('Training session scheduled successfully!');
    setAddTrainingDialogOpen(false);
  };

  const handleCreateTraining = (document: ReportData) => {
    setSelectedDocument(document);
    setTrainingDepartments([]);
    setTrainingStartDate('');
    setTrainingEndDate('');
    setSelectedTrainer('');
    setCreateTrainingDialogOpen(true);
  };

  const handleViewTraining = (training: TrainingRecord) => {
    setSelectedTraining(training);
    setViewTrainingDialogOpen(true);
  };

  const handleConfirmTraining = () => {
    if (trainingDepartments.length === 0) {
      toast.error('Please select at least one department');
      return;
    }
    if (!selectedTrainer) {
      toast.error('Please select a trainer');
      return;
    }
    if (!trainingStartDate) {
      toast.error('Please select a start date');
      return;
    }
    if (!trainingEndDate) {
      toast.error('Please select an end date');
      return;
    }

    // Calculate duration in days
    const start = new Date(trainingStartDate);
    const end = new Date(trainingEndDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const durationText = durationDays === 1 ? '1 day' : `${durationDays} days`;

    // Create a single training record with multiple departments
    const newTraining: TrainingRecord = {
      id: `train_new_${Date.now()}`,
      trainingName: `Training - ${selectedDocument?.fileName}`,
      documentId: selectedDocument?.requestId || 'DOC-XXX',
      documentName: selectedDocument?.fileName || 'Unknown Document',
      department: trainingDepartments[0], // First department for compatibility
      departments: trainingDepartments, // All selected departments
      trainee: 'TBD', // To Be Determined
      trainer: selectedTrainer,
      scheduledDate: trainingStartDate,
      status: 'scheduled' as const,
      attendance: false,
      duration: durationText,
      category: 'Document Training'
    };

    // Add new training to local state
    setLocalTrainings([...localTrainings, newTraining]);

    toast.success(`Training session created for \"${selectedDocument?.fileName}\"!`, {
      description: `Created training for ${trainingDepartments.length} department${trainingDepartments.length > 1 ? 's' : ''}: ${trainingDepartments.join(', ')}`,
      duration: 4000,
    });
    
    // Switch to Schedule Training tab to show the newly created trainings
    setActiveTab('scheduled');
    
    // Reset and close
    setCreateTrainingDialogOpen(false);
    setSelectedDocument(null);
    setTrainingDepartments([]);
    setSelectedTrainer('');
    setTrainingStartDate('');
    setTrainingEndDate('');
  };

  // Calendar Helper Functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getTrainingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredTrainings.filter(training => training.scheduledDate === dateStr);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const calendarDays: (Date | null)[] = [];
  
  // Add empty slots for days before the month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Training Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage published documents and track training programs
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Published Docs</p>
                <p className="text-2xl font-bold text-purple-800">{stats.totalPublished}</p>
              </div>
              <FileCheck className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Sessions</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Score</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.avgScore}%</p>
              </div>
              <Award className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="published" className="w-full" onValueChange={(value) => setActiveTab(value as 'published' | 'scheduled')}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
          <TabsTrigger 
            value="published" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Published Documents ({stats.totalPublished})
          </TabsTrigger>
          <TabsTrigger 
            value="scheduled"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-md transition-all"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Scheduled Training ({stats.total})
          </TabsTrigger>
        </TabsList>

        {/* Filters and Actions */}
        <Card className="mb-6 border-slate-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Filters Label */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Filters:</span>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder={activeTab === 'published' ? "Search documents..." : "Search trainings, trainees, or documents..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-slate-300"
                  />
                </div>
              </div>

              {/* Status Filter (Only for Scheduled Training) */}
              {activeTab === 'scheduled' && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] h-10 border-slate-300">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[200px] h-10 border-slate-300">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle (Only for Scheduled Training) */}
              {activeTab === 'scheduled' && (
                <div className="flex items-center gap-1 ml-auto border border-slate-300 rounded-lg p-1 bg-white">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className={`h-8 w-8 p-0 ${
                      viewMode === 'table'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className={`h-8 w-8 p-0 ${
                      viewMode === 'calendar'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                    title="Calendar View"
                  >
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Published Documents Tab */}
        <TabsContent value="published" className="mt-0">
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-0">
              {filteredPublishedDocs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <FileCheck className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No published documents found
                  </h3>
                  <p className="text-slate-500 text-center max-w-md">
                    No documents have been published yet. Publish documents from the Document Library to see them here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                          onClick={() => toggleSort('fileName')}
                        >
                          <div className="flex items-center gap-1">
                            Document Name
                            {sortField === 'fileName' && (
                              sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">Request ID</TableHead>
                        <TableHead className="font-semibold text-slate-700">Department</TableHead>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                          onClick={() => toggleSort('uploadDate')}
                        >
                          <div className="flex items-center gap-1">
                            Published Date
                            {sortField === 'uploadDate' && (
                              sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">Published By</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">File Size</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPublishedDocs.map((doc) => (
                        <TableRow key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-medium text-slate-800">{doc.fileName}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-mono text-sm text-blue-600">{doc.requestId}</span>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                              {doc.department || 'N/A'}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{doc.publishedDate || doc.uploadDate}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700">{doc.publishedBy || doc.uploadedBy || 'Manager'}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {getStatusBadge(doc.status)}
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 font-mono">
                              {doc.fileSize}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="View Document"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Download Document"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCreateTraining(doc)}
                                className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                title="Create Training"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Training Tab */}
        <TabsContent value="scheduled" className="mt-0">
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-0">
              {filteredTrainings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <GraduationCap className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No training sessions found
                  </h3>
                  <p className="text-slate-500 text-center max-w-md">
                    No training sessions match your search criteria. Try adjusting your filters or schedule a new training session.
                  </p>
                </div>
              ) : viewMode === 'calendar' ? (
                // Calendar View
                <div className="p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">{monthName}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousMonth}
                        className="border-slate-300 hover:bg-slate-100"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextMonth}
                        className="border-slate-300 hover:bg-slate-100"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date())}
                        className="border-slate-300 hover:bg-slate-100"
                      >
                        Today
                      </Button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center font-semibold text-slate-600 text-sm py-2">
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {calendarDays.map((date, index) => {
                      const dayTrainings = date ? getTrainingsForDate(date) : [];
                      const isTodayDate = date ? isToday(date) : false;

                      return (
                        <div
                          key={index}
                          className={`min-h-[120px] border rounded-lg p-2 ${
                            date ? 'bg-white' : 'bg-slate-50'
                          } ${
                            isTodayDate ? 'border-purple-500 border-2 bg-purple-50' : 'border-slate-200'
                          }`}
                        >
                          {date && (
                            <>
                              {/* Date Number */}
                              <div className={`text-sm font-semibold mb-2 ${
                                isTodayDate ? 'text-purple-700' : 'text-slate-700'
                              }`}>
                                {date.getDate()}
                              </div>

                              {/* Training Items */}
                              <div className="space-y-1">
                                {dayTrainings.slice(0, 3).map((training) => {
                                  const statusColors = {
                                    completed: 'bg-green-100 text-green-800 border-green-300',
                                    'in-progress': 'bg-blue-100 text-blue-800 border-blue-300',
                                    scheduled: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                                    overdue: 'bg-red-100 text-red-800 border-red-300',
                                    cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
                                  };

                                  return (
                                    <Popover key={training.id}>
                                      <PopoverTrigger asChild>
                                        <button
                                          className={`w-full text-left text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all ${
                                            statusColors[training.status]
                                          }`}
                                        >
                                          <div className="font-medium truncate">{training.trainingName}</div>
                                          <div className="text-[10px] truncate mt-0.5">{training.trainee}</div>
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-80 bg-white" align="start">
                                        <div className="space-y-3">
                                          <div>
                                            <h4 className="font-bold text-slate-800 mb-1">{training.trainingName}</h4>
                                            {getStatusBadge(training.status)}
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                              <p className="text-slate-500 text-xs">Document ID</p>
                                              <p className="font-mono text-blue-600">{training.documentId}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-500 text-xs">Department</p>
                                              <p className="font-medium text-slate-700">{training.department}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-500 text-xs">Trainee</p>
                                              <p className="text-slate-700">{training.trainee}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-500 text-xs">Trainer</p>
                                              <p className="text-slate-700">{training.trainer}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-500 text-xs">Duration</p>
                                              <p className="text-slate-700">{training.duration}</p>
                                            </div>
                                            {training.score && (
                                              <div>
                                                <p className="text-slate-500 text-xs">Score</p>
                                                <p className="font-semibold text-slate-700">{training.score}%</p>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex gap-2 pt-2 border-t">
                                            <Button variant="outline" size="sm" className="flex-1">
                                              <Eye className="h-3 w-3 mr-1" />
                                              View
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                              <Edit2 className="h-3 w-3 mr-1" />
                                              Edit
                                            </Button>
                                          </div>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  );
                                })}

                                {dayTrainings.length > 3 && (
                                  <div className="text-xs text-center text-slate-600 font-medium pt-1">
                                    +{dayTrainings.length - 3} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar Legend */}
                  <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                      <span className="text-slate-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                      <span className="text-slate-600">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
                      <span className="text-slate-600">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                      <span className="text-slate-600">Overdue</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Table View
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                          onClick={() => toggleSort('trainingName')}
                        >
                          <div className="flex items-center gap-1">
                            Training Name
                            {sortField === 'trainingName' && (
                              sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">Document</TableHead>
                        <TableHead className="font-semibold text-slate-700">Trainee</TableHead>
                        <TableHead className="font-semibold text-slate-700">Trainer</TableHead>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                          onClick={() => toggleSort('scheduledDate')}
                        >
                          <div className="flex items-center gap-1">
                            Scheduled Date
                            {sortField === 'scheduledDate' && (
                              sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                          onClick={() => toggleSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {sortField === 'status' && (
                              sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">Duration</TableHead>
                        <TableHead className="font-semibold text-slate-700">Score</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrainings.map((training) => (
                        <TableRow key={training.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(training.status)}
                              <span className="font-medium text-slate-800">
                                {training.trainingName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-mono text-xs text-blue-600">{training.documentId}</span>
                              <span className="text-sm text-slate-600">{training.documentName}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-700">{training.trainee}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-slate-700">{training.trainer}</span>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{training.scheduledDate}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {getStatusBadge(training.status)}
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                              {training.duration}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {training.score ? (
                              <div className="flex items-center gap-1">
                                <Award className="h-4 w-4 text-yellow-500" />
                                <span className="font-semibold text-slate-700">{training.score}%</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTraining(training)}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Download Certificate"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title="Edit Training"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Training Dialog */}
      <Dialog open={addTrainingDialogOpen} onOpenChange={setAddTrainingDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Schedule New Training
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Create a new training session for document-related procedures
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Training Name</Label>
              <Input placeholder="Enter training name" className="mt-1" />
            </div>

            <div>
              <Label>Document ID</Label>
              <Input placeholder="DOC-XXX" className="mt-1" />
            </div>

            <div>
              <Label>Trainee</Label>
              <Input placeholder="Select trainee" className="mt-1" />
            </div>

            <div>
              <Label>Department</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Quality Assurance</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="supply-chain">Supply Chain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Scheduled Date</Label>
              <Input type="date" className="mt-1" />
            </div>

            <div>
              <Label>Duration</Label>
              <Input placeholder="e.g., 2 hours" className="mt-1" />
            </div>

            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea placeholder="Additional notes or requirements" className="mt-1" rows={3} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAddTrainingDialogOpen(false)}
              className="gap-2 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTraining}
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <GraduationCap className="h-4 w-4" />
              Schedule Training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Training Dialog */}
      <Dialog open={createTrainingDialogOpen} onOpenChange={setCreateTrainingDialogOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Create Training Session
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Schedule training for <span className="font-semibold text-slate-800">{selectedDocument?.fileName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Document Information - Read Only */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-slate-700">Document Information</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500">Request ID:</span>
                  <p className="font-mono text-blue-600">{selectedDocument?.requestId}</p>
                </div>
                <div>
                  <span className="text-slate-500">Department:</span>
                  <p className="font-medium text-slate-700">{selectedDocument?.department}</p>
                </div>
              </div>
            </div>

            {/* Department Selection - Multi-Select */}
            <div>
              <Label className="text-slate-700 font-semibold">
                Training Departments <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full mt-2 h-11 justify-between border-slate-300 bg-white hover:bg-slate-50"
                  >
                    <span className="truncate">
                      {trainingDepartments.length === 0
                        ? 'Select departments for training'
                        : `${trainingDepartments.length} department${trainingDepartments.length > 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {['Quality Assurance', 'Engineering', 'Manufacturing', 'Supply Chain', 'Operations', 'R&D', 'Compliance'].map((dept) => (
                      <div
                        key={dept}
                        className="flex items-center space-x-2 rounded-md px-2 py-2 hover:bg-slate-100 cursor-pointer"
                        onClick={() => {
                          if (trainingDepartments.includes(dept)) {
                            setTrainingDepartments(trainingDepartments.filter(d => d !== dept));
                          } else {
                            setTrainingDepartments([...trainingDepartments, dept]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={trainingDepartments.includes(dept)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTrainingDepartments([...trainingDepartments, dept]);
                            } else {
                              setTrainingDepartments(trainingDepartments.filter(d => d !== dept));
                            }
                          }}
                        />
                        <label className="flex-1 text-sm font-medium cursor-pointer">
                          {dept}
                        </label>
                      </div>
                    ))}
                  </div>
                  {trainingDepartments.length > 0 && (
                    <div className="border-t p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">
                          {trainingDepartments.length} selected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTrainingDepartments([])}
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              {/* Selected Departments Display */}
              {trainingDepartments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {trainingDepartments.map((dept) => (
                    <Badge
                      key={dept}
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-300 pl-2 pr-1"
                    >
                      {dept}
                      <button
                        onClick={() => setTrainingDepartments(trainingDepartments.filter(d => d !== dept))}
                        className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1">Select which departments will receive this training</p>
            </div>

            {/* Trainer Selection */}
            <div>
              <Label className="text-slate-700 font-semibold">
                Trainer <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                <SelectTrigger className="mt-2 h-11 border-slate-300 bg-white">
                  <SelectValue placeholder="Select trainer for this session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah Manager">Sarah Manager</SelectItem>
                  <SelectItem value="John Smith">John Smith</SelectItem>
                  <SelectItem value="Emily Davis">Emily Davis</SelectItem>
                  <SelectItem value="Michael Chen">Michael Chen</SelectItem>
                  <SelectItem value="Lisa Anderson">Lisa Anderson</SelectItem>
                  <SelectItem value="David Wilson">David Wilson</SelectItem>
                  <SelectItem value="Rachel Martinez">Rachel Martinez</SelectItem>
                  <SelectItem value="James Taylor">James Taylor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">Who will conduct this training session?</p>
            </div>

            {/* Start Date */}
            <div>
              <Label className="text-slate-700 font-semibold">
                Training Start Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Calendar className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <Input
                  type="date"
                  value={trainingStartDate}
                  onChange={(e) => setTrainingStartDate(e.target.value)}
                  className="pl-10 h-11 border-slate-300"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">When should the training begin?</p>
            </div>

            {/* End Date */}
            <div>
              <Label className="text-slate-700 font-semibold">
                Training End Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Calendar className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                <Input
                  type="date"
                  value={trainingEndDate}
                  onChange={(e) => setTrainingEndDate(e.target.value)}
                  className="pl-10 h-11 border-slate-300"
                  min={trainingStartDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">When should the training be completed?</p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setCreateTrainingDialogOpen(false);
                setSelectedDocument(null);
                setTrainingDepartments([]);
                setSelectedTrainer('');
                setTrainingStartDate('');
                setTrainingEndDate('');
              }}
              className="gap-2 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTraining}
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Send className="h-4 w-4" />
              Create Training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Training Dialog */}
      <Dialog open={viewTrainingDialogOpen} onOpenChange={setViewTrainingDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Training Details
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              View complete information about this training session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Document Information */}
            <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {selectedTraining?.documentName}
                  </h3>
                  <p className="text-sm text-slate-600">Training Document</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-purple-100">
                  <p className="text-xs text-slate-500 mb-1">Request ID</p>
                  <p className="font-mono text-blue-600 font-semibold">
                    {selectedTraining?.documentId}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-purple-100">
                  <p className="text-xs text-slate-500 mb-1">Scheduled Date</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <p className="font-medium text-slate-800">
                      {selectedTraining?.scheduledDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Departments Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-indigo-600" />
                <h4 className="font-bold text-slate-800">Departments</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {(selectedTraining?.departments || [selectedTraining?.department]).filter(Boolean).map((dept, index) => (
                  <Badge 
                    key={index}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 text-sm font-medium shadow-md"
                  >
                    {dept}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {(selectedTraining?.departments || [selectedTraining?.department]).filter(Boolean).length} department(s) selected for this training
              </p>
            </div>

            {/* Additional Information Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-slate-500" />
                  <p className="text-xs text-slate-500">Trainee</p>
                </div>
                <p className="font-medium text-slate-800">{selectedTraining?.trainee}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-slate-500" />
                  <p className="text-xs text-slate-500">Trainer</p>
                </div>
                <p className="font-medium text-slate-800">{selectedTraining?.trainer}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <p className="text-xs text-slate-500">Duration</p>
                </div>
                <p className="font-medium text-slate-800">{selectedTraining?.duration}</p>
              </div>
            </div>

            {/* Status and Score */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Status:</span>
                {selectedTraining && getStatusBadge(selectedTraining.status)}
              </div>
              {selectedTraining?.score && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-lg font-bold text-slate-800">{selectedTraining.score}%</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setViewTrainingDialogOpen(false);
                setSelectedTraining(null);
              }}
              className="gap-2 border-slate-300 hover:bg-slate-50"
            >
              Close
            </Button>
            <Button
              className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Edit2 className="h-4 w-4" />
              Edit Training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};