import React, { useState } from 'react';
import {
  GitCompare,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Calendar,
  User,
  Clock,
  GitBranch,
  ChevronDown,
  ChevronUp,
  History,
  GitCommit,
  ArrowRight,
  FileCheck,
  FileDiff,
  Upload,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Columns,
  Layout
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

interface VersionRecord {
  id: string;
  documentId: string;
  documentName: string;
  version: string;
  previousVersion?: string;
  department: string;
  publishedDate: string;
  author: string;
  changeDescription: string;
  status: 'current' | 'archived' | 'draft';
  fileSize: string;
  approver?: string;
  approvalDate?: string;
  downloadCount: number;
  changeType: 'major' | 'minor';
}

export const DocumentVersioning: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'documentName' | 'version' | 'publishedDate'>('publishedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uploadVersionDialogOpen, setUploadVersionDialogOpen] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [leftCompare, setLeftCompare] = useState({ versionId: '', page: 1 });
  const [rightCompare, setRightCompare] = useState({ versionId: '', page: 1 });
  const [selectedVersions, setSelectedVersions] = useState<VersionRecord[]>([]);

  // Mock version data
  const [versions] = useState<VersionRecord[]>([
    {
      id: 'ver_1',
      documentId: 'DOC-001',
      documentName: 'Quality Management System',
      version: 'v2.1',
      previousVersion: 'v2.0',
      department: 'Quality Assurance',
      publishedDate: '2025-01-15',
      author: 'Sarah Manager',
      changeDescription: 'Updated quality control procedures and added new inspection criteria',
      status: 'current',
      fileSize: '2.4 MB',
      approver: 'John Admin',
      approvalDate: '2025-01-14',
      downloadCount: 145,
      changeType: 'minor'
    },
    {
      id: 'ver_2',
      documentId: 'DOC-001',
      documentName: 'Quality Management System',
      version: 'v2.0',
      previousVersion: 'v1.9',
      department: 'Quality Assurance',
      publishedDate: '2024-10-15',
      author: 'Mike Johnson',
      changeDescription: 'Major revision incorporating ISO 9001:2015 standards',
      status: 'archived',
      fileSize: '2.2 MB',
      approver: 'John Admin',
      approvalDate: '2024-10-14',
      downloadCount: 267,
      changeType: 'major'
    },
    {
      id: 'ver_3',
      documentId: 'DOC-002',
      documentName: 'Safety Guidelines',
      version: 'v2.1',
      previousVersion: 'v2.0',
      department: 'Manufacturing',
      publishedDate: '2025-01-20',
      author: 'Emily Davis',
      changeDescription: 'Added new safety protocols for equipment handling',
      status: 'current',
      fileSize: '1.8 MB',
      approver: 'John Admin',
      approvalDate: '2025-01-19',
      downloadCount: 98,
      changeType: 'minor'
    },
    {
      id: 'ver_4',
      documentId: 'DOC-003',
      documentName: 'ISO Standards Handbook',
      version: 'v3.0',
      previousVersion: 'v2.5',
      department: 'Engineering',
      publishedDate: '2025-01-10',
      author: 'David Wilson',
      changeDescription: 'Complete restructure with new compliance requirements',
      status: 'current',
      fileSize: '3.1 MB',
      approver: 'John Admin',
      approvalDate: '2025-01-09',
      downloadCount: 203,
      changeType: 'major'
    },
    {
      id: 'ver_5',
      documentId: 'DOC-003',
      documentName: 'ISO Standards Handbook',
      version: 'v2.5',
      previousVersion: 'v2.4',
      department: 'Engineering',
      publishedDate: '2024-09-20',
      author: 'Lisa Chen',
      changeDescription: 'Minor corrections and clarifications',
      status: 'archived',
      fileSize: '2.9 MB',
      approver: 'John Admin',
      approvalDate: '2024-09-19',
      downloadCount: 312,
      changeType: 'minor'
    },
    {
      id: 'ver_6',
      documentId: 'DOC-004',
      documentName: 'SCM Procedures Manual',
      version: 'v1.6',
      department: 'Supply Chain',
      publishedDate: '2025-01-25',
      author: 'Sarah Manager',
      changeDescription: 'Draft version - pending review',
      status: 'draft',
      fileSize: '1.5 MB',
      downloadCount: 12,
      changeType: 'minor'
    }
  ]);

  const departments = Array.from(new Set(versions.map(v => v.department)));

  // Filter and sort versions
  const filteredVersions = versions
    .filter(version => {
      const matchesSearch =
        version.documentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        version.documentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        version.version?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || version.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || version.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'documentName') {
        comparison = a.documentName.localeCompare(b.documentName);
      } else if (sortField === 'version') {
        comparison = a.version.localeCompare(b.version);
      } else if (sortField === 'publishedDate') {
        comparison = new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'current': { label: 'Current', className: 'bg-green-500 text-white' },
      'archived': { label: 'Archived', className: 'bg-gray-500 text-white' },
      'draft': { label: 'Draft', className: 'bg-yellow-500 text-white' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <Badge className={`${config.className} font-medium`}>
        {config.label}
      </Badge>
    );
  };

  const getChangeTypeBadge = (changeType: string) => {
    const typeConfig = {
      'major': { label: 'Major', className: 'bg-red-100 text-red-700 border-red-300' },
      'minor': { label: 'Minor', className: 'bg-blue-100 text-blue-700 border-blue-300' }
    };

    const config = typeConfig[changeType as keyof typeof typeConfig] || typeConfig.minor;

    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const toggleSort = (field: 'documentName' | 'version' | 'publishedDate') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Calculate statistics
  const stats = {
    total: versions.length,
    current: versions.filter(v => v.status === 'current').length,
    archived: versions.filter(v => v.status === 'archived').length,
    draft: versions.filter(v => v.status === 'draft').length,
    uniqueDocs: new Set(versions.map(v => v.documentId)).size,
    totalDownloads: versions.reduce((sum, v) => sum + v.downloadCount, 0)
  };

  const handleUploadVersion = () => {
    setUploadVersionDialogOpen(true);
  };

  const handleSaveVersion = () => {
    toast.success('New version uploaded successfully!');
    setUploadVersionDialogOpen(false);
  };

  const handleCompareVersions = (version: VersionRecord) => {
    // When clicking compare, we want to find other versions of the same document
    const documentVersions = versions.filter(v => v.documentId === version.documentId);
    
    setLeftCompare({ versionId: version.id, page: 1 });
    
    // Default right side to previous version if available, or just the same version
    const otherVersion = documentVersions.find(v => v.id !== version.id) || version;
    setRightCompare({ versionId: otherVersion.id, page: 1 });
    
    setIsComparing(true);
  };

  if (isComparing) {
    const leftVer = versions.find(v => v.id === leftCompare.versionId);
    const rightVer = versions.find(v => v.id === rightCompare.versionId);
    const allVersions = versions;

    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
        {/* Comparison Header */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsComparing(false)}
              className="text-slate-600 hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <GitCompare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Version Comparison</h2>
                <p className="text-xs text-slate-500 font-mono">{leftVer?.documentId} - {leftVer?.documentName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <Columns className="h-3 w-3 mr-1" />
              Split View
            </Badge>
            <Button size="sm" className="bg-indigo-600 text-white">
              <Download className="h-4 w-4 mr-2" />
              Export Diff
            </Button>
          </div>
        </div>

        {/* Comparison Body */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Left Side */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Version Selection</Label>
                <Select 
                  value={leftCompare.versionId} 
                  onValueChange={(val) => setLeftCompare({ ...leftCompare, versionId: val })}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {allVersions.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.documentId} - {v.version} ({v.documentName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Page No.</Label>
                <Select 
                  value={leftCompare.page.toString()} 
                  onValueChange={(val) => setLeftCompare({ ...leftCompare, page: parseInt(val) })}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(p => (
                      <SelectItem key={p} value={p.toString()}>Page {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 bg-slate-100/50">
              <div className="max-w-2xl mx-auto bg-white shadow-lg border border-slate-200 aspect-[1/1.4] p-12 relative">
                <div className="absolute top-8 right-8 text-[10px] font-mono text-slate-400">
                  {leftVer?.documentId} | VERSION {leftVer?.version} | PAGE {leftCompare.page}
                </div>
                
                <div className="space-y-6">
                  <div className="h-8 w-1/3 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-2/3 bg-slate-50 rounded" />
                  
                  <div className="py-8 border-y border-slate-100 my-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Section {leftCompare.page}.1 - Procedures</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {leftVer?.changeDescription || "Standard operating procedure text for the selected version and page. This area would contain the actual document content rendering."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-slate-50 rounded border border-dashed border-slate-200" />
                    <div className="h-20 bg-slate-50 rounded border border-dashed border-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex-1">
                <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Version Selection</Label>
                <Select 
                  value={rightCompare.versionId} 
                  onValueChange={(val) => setRightCompare({ ...rightCompare, versionId: val })}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {allVersions.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.documentId} - {v.version} ({v.documentName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Page No.</Label>
                <Select 
                  value={rightCompare.page.toString()} 
                  onValueChange={(val) => setRightCompare({ ...rightCompare, page: parseInt(val) })}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(p => (
                      <SelectItem key={p} value={p.toString()}>Page {p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-8 bg-slate-100/50">
              <div className="max-w-2xl mx-auto bg-white shadow-lg border border-slate-200 aspect-[1/1.4] p-12 relative">
                <div className="absolute top-8 right-8 text-[10px] font-mono text-slate-400">
                  {rightVer?.documentId} | VERSION {rightVer?.version} | PAGE {rightCompare.page}
                </div>
                
                <div className="space-y-6">
                  <div className="h-8 w-1/3 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-full bg-slate-50 rounded" />
                  <div className="h-4 w-2/3 bg-slate-50 rounded" />
                  
                  <div className="py-8 border-y border-slate-100 my-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 text-indigo-600">Section {rightCompare.page}.1 - Procedures</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {rightVer?.changeDescription || "Standard operating procedure text for the selected version and page. This area would contain the actual document content rendering."}
                    </p>
                    <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-700">
                      <strong>Highlight:</strong> This version contains updated safety protocols and equipment handling requirements compared to the left version.
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-indigo-50/50 rounded border border-indigo-200" />
                    <div className="h-20 bg-slate-50 rounded border border-dashed border-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <GitCompare className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Document Versioning
            </h1>
            <p className="text-slate-600 mt-1">
              Track and manage document versions with change history
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Versions</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <History className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Current</p>
                <p className="text-2xl font-bold text-green-600">{stats.current}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Archived</p>
                <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <FileDiff className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Documents</p>
                <p className="text-2xl font-bold text-blue-600">{stats.uniqueDocs}</p>
              </div>
              <FileCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search documents or versions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-10 border-slate-300">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

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

            {/* Upload Version Button */}
            <Button
              onClick={handleUploadVersion}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg ml-auto"
            >
              <Upload className="h-4 w-4" />
              Upload New Version
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Version Table */}
      <Card className="border-slate-200 shadow-lg">
        <CardContent className="p-0">
          {filteredVersions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <GitCompare className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No versions found
              </h3>
              <p className="text-slate-500 text-center max-w-md">
                No versions match your search criteria. Try adjusting your filters or upload a new version.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('documentName')}
                    >
                      <div className="flex items-center gap-1">
                        Document
                        {sortField === 'documentName' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('version')}
                    >
                      <div className="flex items-center gap-1">
                        Version
                        {sortField === 'version' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Change Type</TableHead>
                    <TableHead className="font-semibold text-slate-700">Department</TableHead>
                    <TableHead className="font-semibold text-slate-700">Author</TableHead>
                    <TableHead 
                      className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                      onClick={() => toggleSort('publishedDate')}
                    >
                      <div className="flex items-center gap-1">
                        Published Date
                        {sortField === 'publishedDate' && (
                          sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Changes</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVersions.map((version) => (
                    <TableRow key={version.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-blue-600">{version.documentId}</span>
                            <span className="font-medium text-slate-800">{version.documentName}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GitCommit className="h-4 w-4 text-purple-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-purple-700">{version.version}</span>
                            {version.previousVersion && (
                              <span className="text-xs text-slate-500">from {version.previousVersion}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getChangeTypeBadge(version.changeType)}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300">
                          {version.department}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-700">{version.author}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{version.publishedDate}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(version.status)}
                      </TableCell>

                      <TableCell>
                        <p className="text-sm text-slate-600 max-w-[200px] truncate" title={version.changeDescription}>
                          {version.changeDescription}
                        </p>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="View Version"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Download Version"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCompareVersions(version)}
                            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Compare Versions"
                          >
                            <GitCompare className="h-4 w-4" />
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

      {/* Upload Version Dialog */}
      <Dialog open={uploadVersionDialogOpen} onOpenChange={setUploadVersionDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Upload New Version
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Create a new version of an existing document
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Document</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doc1">DOC-001 - Quality Management System</SelectItem>
                  <SelectItem value="doc2">DOC-002 - Safety Guidelines</SelectItem>
                  <SelectItem value="doc3">DOC-003 - ISO Standards Handbook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Version Number</Label>
              <Input placeholder="e.g., v2.2" className="mt-1" />
            </div>

            <div>
              <Label>Change Type</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="patch">Patch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Upload File</Label>
              <Input type="file" className="mt-1" />
            </div>

            <div className="col-span-2">
              <Label>Change Description</Label>
              <Textarea placeholder="Describe the changes in this version" className="mt-1" rows={4} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setUploadVersionDialogOpen(false)}
              className="gap-2 border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVersion}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Upload className="h-4 w-4" />
              Upload Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
