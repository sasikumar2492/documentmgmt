import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  FileText, 
  Plus,
  Edit,
  Download,
  Eye,
  Trash2,
  Upload,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export const SOPConfiguration: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const sopDocuments = [
    {
      id: 1,
      code: 'SOP-QA-001',
      title: 'Quality Assurance Testing Procedures',
      version: '2.1',
      department: 'Quality Assurance',
      status: 'active',
      lastUpdated: '2024-01-15',
      updatedBy: 'Sarah Johnson',
      downloads: 145,
      color: 'green'
    },
    {
      id: 2,
      code: 'SOP-PE-002',
      title: 'Production Engineering Standards',
      version: '1.8',
      department: 'Production Engineering',
      status: 'active',
      lastUpdated: '2024-01-10',
      updatedBy: 'Michael Chen',
      downloads: 98,
      color: 'blue'
    },
    {
      id: 3,
      code: 'SOP-SC-003',
      title: 'Supplier Approval Process',
      version: '3.0',
      department: 'Supply Chain',
      status: 'review',
      lastUpdated: '2024-01-20',
      updatedBy: 'Emily Rodriguez',
      downloads: 67,
      color: 'orange'
    },
    {
      id: 4,
      code: 'SOP-RD-004',
      title: 'Research & Development Guidelines',
      version: '1.5',
      department: 'Research & Development',
      status: 'active',
      lastUpdated: '2024-01-08',
      updatedBy: 'David Kim',
      downloads: 112,
      color: 'purple'
    },
    {
      id: 5,
      code: 'SOP-MFG-005',
      title: 'Manufacturing Safety Protocols',
      version: '2.3',
      department: 'Manufacturing',
      status: 'draft',
      lastUpdated: '2024-01-22',
      updatedBy: 'Lisa Anderson',
      downloads: 34,
      color: 'yellow'
    }
  ];

  const statusConfig = {
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
    review: { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
    draft: { label: 'Draft', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: AlertCircle }
  };

  const filtered = sopDocuments.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            SOP Configuration
          </h1>
          <p className="text-slate-500 mt-1">Manage Standard Operating Procedures</p>
        </div>
        <Button 
          className="bg-blue-600 text-white shadow-lg hover:bg-blue-700 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload New SOP
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6 bg-white relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total SOPs</p>
                <h3 className="text-3xl font-bold text-slate-800">{sopDocuments.length}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {sopDocuments.filter(s => s.status === 'active').length}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Under Review</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {sopDocuments.filter(s => s.status === 'review').length}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-sm border border-amber-100">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Drafts</p>
                <h3 className="text-3xl font-bold text-slate-800">
                  {sopDocuments.filter(s => s.status === 'draft').length}
                </h3>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-xl shadow-slate-200/50 border-0 rounded-2xl overflow-hidden">
        <CardContent className="p-4 bg-white">
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search SOPs by code, title, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl"
              />
            </div>
            <Button variant="ghost" className="h-12 px-6 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl bg-white">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SOP Documents List */}
      <Card className="shadow-2xl shadow-slate-200/60 border-0 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-6">
          <CardTitle className="flex items-center gap-3 text-slate-800 font-bold">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            SOP Documents
          </CardTitle>
          <CardDescription className="text-slate-500">Configure and manage organizational standard operating procedures</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filtered.map((sop) => {
              const StatusIcon = statusConfig[sop.status as keyof typeof statusConfig].icon;
              
              return (
                <div 
                  key={sop.id}
                  className="flex items-center gap-6 p-6 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 transition-all">
                    <FileText className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">{sop.title}</h3>
                      <Badge className="bg-slate-100 text-slate-600 border-0 font-semibold px-2">
                        {sop.code}
                      </Badge>
                      <Badge className="bg-blue-50 text-blue-600 border-0 font-bold px-2">
                        v{sop.version}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{sop.department}</span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Updated: {sop.lastUpdated}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        <span>{sop.downloads} downloads</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full border-0 font-bold ${statusConfig[sop.status as keyof typeof statusConfig].color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig[sop.status as keyof typeof statusConfig].label}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-blue-600 hover:bg-blue-50 bg-white border border-slate-100"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50 bg-white border border-slate-100"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-indigo-600 hover:bg-indigo-50 bg-white border border-slate-100"
                        title="Edit SOP"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-9 w-9 rounded-xl text-rose-600 hover:bg-rose-50 bg-white border border-slate-100"
                        title="Delete SOP"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">No SOPs found</h3>
              <p className="text-slate-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload New SOP Card */}
      <Card className="shadow-xl shadow-slate-200/50 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group rounded-2xl">
        <CardContent className="p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            <Upload className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Upload New SOP Document</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Digitize and standardize your operating procedures by uploading them to the system</p>
          <Button className="bg-blue-600 text-white shadow-xl hover:bg-blue-700 h-11 px-8 rounded-xl font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
