import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  FileCheck, 
  Search, 
  Eye, 
  Send, 
  Calendar,
  CheckCircle,
  Filter,
  Building2,
  User,
  Hash
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ReportData } from '../types';

interface DocumentPublishingProps {
  reports: ReportData[];
  onViewForm: (reportId: string) => void;
  onPreviewDocument: (reportId: string) => void;
  onPublishDocument: (reportId: string) => void;
}

export const DocumentPublishing: React.FC<DocumentPublishingProps> = ({ 
  reports, 
  onViewForm,
  onPreviewDocument,
  onPublishDocument
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const handlePreview = (reportId: string) => {
    onPreviewDocument(reportId);
  };

  // Filter only approved documents
  const approvedDocuments = reports.filter(report => report.status === 'approved');

  // Apply search and department filters
  const filteredDocuments = approvedDocuments.filter(report => {
    const matchesSearch = 
      (report.documentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.documentTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (report.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || report.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = Array.from(new Set(reports.map(r => r.department).filter(Boolean)));

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-br from-pale-blue-50 via-pale-blue-100 to-pale-blue-200 min-h-full p-6 space-y-6">
      {/* Header Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
                <FileCheck className="h-8 w-8 text-blue-600" />
                Document Publishing
              </h1>
              <p className="text-slate-600">Publish and distribute approved documents across departments</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{approvedDocuments.length}</div>
              <div className="text-sm text-slate-600">Approved Documents</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by document ID, title, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-64">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <Filter className="h-4 w-4" />
            Showing {filteredDocuments.length} of {approvedDocuments.length} approved documents
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <CardTitle className="text-xl font-semibold text-slate-800">Approved Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-16">
              <FileCheck className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Approved Documents</h3>
              <p className="text-gray-500">
                {approvedDocuments.length === 0 
                  ? "There are no approved documents available for publishing yet."
                  : "No documents match your search criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Document ID
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Document Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Department
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Prepared By
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Approved Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((report) => (
                    <tr 
                      key={report.id} 
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">
                          {report.documentId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800 max-w-xs truncate">
                          {report.documentTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-slate-600">{report.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-slate-600">{report.preparedBy || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-slate-600">{formatDate(report.approvedDate || report.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200">
                          <CheckCircle className="h-3 w-3" />
                          Approved
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Preview Icon - Replacing generic icon */}
                          <Button
                            onClick={() => handlePreview(report.id)}
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm transition-all duration-200"
                            title="Preview Document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Publish Icon */}
                          <Button
                            onClick={() => onPublishDocument(report.id)}
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                            title="Publish Document"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview is now a full screen view handled by handlePreview navigation */}
    </div>
  );
};