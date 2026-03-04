import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Folder,
  FolderOpen,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  ChevronRight,
  ChevronDown,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  User,
  Building2,
  Package,
  MapPin,
  Tag,
  Clock,
  FileType,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  ScrollText,
  BarChart3,
  Sparkles,
  Layers,
  FolderTree,
  GitBranch,
  Star,
  Upload,
  Edit2,
  Copy,
  FolderInput,
  CheckSquare,
  Square,
  Archive,
  Share2,
  MoreVertical,
  Plus,
  History,
  RefreshCw,
  ClipboardCheck,
  FileDown,
  FileCheck,
  UploadCloud
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ReportData, ViewType } from '../types';
import { TemplateData } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';
import { WorkflowDialog } from './WorkflowDialog';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

import { ImageWithFallback } from './figma/ImageWithFallback';

interface DocumentLibraryProps {
  reports: ReportData[];
  templates?: TemplateData[];
  /** Optional list of departments to show department names instead of IDs for template rows */
  departments?: { id: string; name: string }[];
  onViewForm: (reportId: string) => void;
  onPreviewDocument: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onDownloadDocument: (reportId: string, fileName: string) => void;
  onNavigate?: (view: ViewType, options?: { requestId?: string }) => void;
  onPublishDocument?: (reportId: string) => void;
  userRole?: string;
  currentUsername?: string;
}

interface FolderNode {
  id: string;
  name: string;
  type: 'folder' | 'document';
  children?: FolderNode[];
  document?: ReportData;
  metadata?: {
    documentType?: string;
    department?: string;
    product?: string;
    site?: string;
  };
  path: string[];
}

type ViewMode = 'tree' | 'grid' | 'table';
type SortField = 'name' | 'date' | 'type' | 'status' | 'id' | 'department' | 'size' | 'assignedTo' | 'lastModified';
type SortOrder = 'asc' | 'desc';

export const DocumentLibrary: React.FC<DocumentLibraryProps> = (({
  reports = [],
  templates = [],
  departments = [],
  onViewForm,
  onPreviewDocument,
  onDeleteReport,
  onDownloadDocument,
  onNavigate,
  onPublishDocument,
  userRole = 'admin',
  currentUsername = ''
}) => {
  // Default to table view for all roles to ensure newest submissions are visible immediately
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Advanced filters
  const [filterDocumentType, setFilterDocumentType] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterProduct, setFilterProduct] = useState<string>('all');
  const [filterSite, setFilterSite] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  
  // Workflow and Preview
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ReportData | null>(null);

  // Enhanced features state
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [documentTags, setDocumentTags] = useState<Record<string, string[]>>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [renamingDocument, setRenamingDocument] = useState<ReportData | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newTags, setNewTags] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const documentThumbnails: Record<string, string> = {
    'sample-template-1': 'https://images.unsplash.com/photo-1693045181254-08462917f681?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'sample-template-2': 'https://images.unsplash.com/photo-1727522974631-c8779e7de5d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'sample-template-3': 'https://images.unsplash.com/photo-1600531597946-f9b1d7b0f486?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'report_1': 'https://images.unsplash.com/photo-1583737077813-bc3945c54a4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'report_2': 'https://images.unsplash.com/photo-1632152053560-2ff69f7981f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    'report_3': 'https://images.unsplash.com/photo-1581092335331-5e00ac65e934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400'
  };

  const getThumbnail = (id: string) => documentThumbnails[id] || 'https://images.unsplash.com/photo-1568992687345-269c8352f0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';

  /** Format file size: if numeric (bytes) show as MB/KB, else show as-is (e.g. "N/A" or "1.5 MB"). */
  const formatFileSize = (fileSize: string | undefined): string => {
    if (!fileSize || fileSize === 'N/A') return 'N/A';
    const num = parseFloat(fileSize.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(num)) return fileSize;
    if (num >= 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    if (num >= 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${num} B`;
  };

  // Map department ID -> name for template rows
  const departmentNameById = useMemo(() => {
    const map: Record<string, string> = {};
    (departments || []).forEach((d) => {
      if (d?.id && d?.name) map[d.id] = d.name;
    });
    return map;
  }, [departments]);

  // Merge templates with reports to create a unified document list
  const allDocuments = useMemo(() => {
    // Convert templates to ReportData format (department shown as name when available)
    const templatesAsReports: ReportData[] = templates.map((template) => {
      const deptId = template.department;
      const deptDisplay = deptId ? (departmentNameById[deptId] ?? deptId) : 'N/A';
      return {
        id: template.id,
        requestId: 'TEMPLATE',
        fileName: template.fileName,
        uploadDate: template.uploadDate,
        lastModified: template.uploadDate,
        assignedTo: deptDisplay,
        department: deptDisplay,
        status: (template.status || 'pending') as any,
        fileSize: template.fileSize || 'N/A',
        documentType: 'Template',
        product: 'General',
        site: 'Main Site',
        uploadedBy: 'System',
        fromUser: undefined,
        formData: template.convertedFormData as any,
        formPages: undefined,
      };
    });

    // Combine reports and templates
    const combined = [...reports, ...templatesAsReports];

    return combined;
  }, [reports, templates, departmentNameById]);

  // Extract unique values for filters
  const documentTypes = useMemo(() => {
    const types = new Set(allDocuments.map(r => r.documentType || 'Template').filter(Boolean));
    return ['all', ...Array.from(types)];
  }, [allDocuments]);

  const departmentFilterOptions = useMemo(() => {
    const depts = new Set(allDocuments.map(r => r.department).filter(Boolean));
    return ['all', ...Array.from(depts)];
  }, [allDocuments]);

  const products = useMemo(() => {
    const prods = new Set(allDocuments.map(r => r.product || 'General').filter(Boolean));
    return ['all', ...Array.from(prods)];
  }, [allDocuments]);

  const sites = useMemo(() => {
    const siteList = new Set(allDocuments.map(r => r.site || 'Main Site').filter(Boolean));
    return ['all', ...Array.from(siteList)];
  }, [allDocuments]);

  // Build folder hierarchy
  const folderHierarchy = useMemo(() => {
    const root: FolderNode = {
      id: 'root',
      name: 'Document Library',
      type: 'folder',
      children: [],
      path: []
    };

    // Create department folders
    const departmentMap = new Map<string, FolderNode>();
    
    allDocuments.forEach(report => {
      const dept = report.department || 'Uncategorized';
      
      if (!departmentMap.has(dept)) {
        const deptNode: FolderNode = {
          id: `dept-${dept}`,
          name: dept,
          type: 'folder',
          children: [],
          path: [dept]
        };
        departmentMap.set(dept, deptNode);
        root.children!.push(deptNode);
      }

      const deptNode = departmentMap.get(dept)!;
      
      // Create document type subfolder
      const docType = report.documentType || 'Template';
      let typeNode = deptNode.children!.find(n => n.name === docType);
      
      if (!typeNode) {
        typeNode = {
          id: `type-${dept}-${docType}`,
          name: docType,
          type: 'folder',
          children: [],
          path: [dept, docType]
        };
        deptNode.children!.push(typeNode);
      }

      // Add document
      const docNode: FolderNode = {
        id: report.id,
        name: report.fileName,
        type: 'document',
        document: report,
        metadata: {
          documentType: report.documentType || 'Template',
          department: report.department,
          product: report.product || 'General',
          site: report.site || 'Main Site'
        },
        path: [dept, docType, report.fileName]
      };
      
      typeNode.children!.push(docNode);
    });

    // Sort folders and documents
    const sortNodes = (nodes: FolderNode[]) => {
      nodes.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'document') return -1;
        if (a.type === 'document' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => {
        if (node.children) sortNodes(node.children);
      });
    };

    sortNodes(root.children || []);
    return root;
  }, [allDocuments]);

  // Filter documents based on all criteria
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(report => {
      // Text search (full-text search simulation)
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        report.fileName?.toLowerCase().includes(searchLower) ||
        report.requestId?.toLowerCase().includes(searchLower) ||
        report.department?.toLowerCase().includes(searchLower) ||
        report.product?.toLowerCase().includes(searchLower) ||
        report.site?.toLowerCase().includes(searchLower) ||
        report.documentType?.toLowerCase().includes(searchLower);

      // Metadata filters
      const matchesDocType = filterDocumentType === 'all' || 
        (report.documentType || 'Template') === filterDocumentType;
      const matchesDept = filterDepartment === 'all' || 
        report.department === filterDepartment;
      const matchesProduct = filterProduct === 'all' || 
        (report.product || 'General') === filterProduct;
      const matchesSite = filterSite === 'all' || 
        (report.site || 'Main Site') === filterSite;
      const matchesStatus = filterStatus === 'all' || 
        report.status === filterStatus;

      // Date range filter
      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const docDate = new Date(report.uploadDate || report.lastModified || 0);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (filterDateRange) {
          case 'today':
            matchesDate = diffDays === 0;
            break;
          case 'week':
            matchesDate = diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays <= 30;
            break;
          case 'quarter':
            matchesDate = diffDays <= 90;
            break;
        }
      }

      return matchesSearch && matchesDocType && matchesDept && 
             matchesProduct && matchesSite && matchesStatus && matchesDate;
    });
  }, [allDocuments, searchTerm, filterDocumentType, filterDepartment, filterProduct, 
      filterSite, filterStatus, filterDateRange]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    const docs = [...filteredDocuments];
    docs.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = (a.requestId || '').localeCompare(b.requestId || '');
          break;
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName);
          break;
        case 'department':
          comparison = (a.department || '').localeCompare(b.department || '');
          break;
        case 'date':
          const dateA = new Date(a.lastModified || a.uploadDate || 0).getTime();
          const dateB = new Date(b.lastModified || b.uploadDate || 0).getTime();
          comparison = dateA - dateB;
          break;
        case 'type':
          comparison = (a.documentType || 'Template').localeCompare(b.documentType || 'Template');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'size':
          const sizeA = parseFloat((a.fileSize || '0').replace(/[^0-9.]/g, ''));
          const sizeB = parseFloat((b.fileSize || '0').replace(/[^0-9.]/g, ''));
          comparison = sizeA - sizeB;
          break;
        case 'assignedTo':
          comparison = (a.assignedTo || '').localeCompare(b.assignedTo || '');
          break;
        case 'lastModified':
          const lastModA = new Date(a.lastModified || a.uploadDate || 0).getTime();
          const lastModB = new Date(b.lastModified || b.uploadDate || 0).getTime();
          comparison = lastModA - lastModB;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return docs;
  }, [filteredDocuments, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = sortedDocuments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDocumentType, filterDepartment, filterProduct, filterSite, filterStatus, filterDateRange]);

  const canUserEdit = (doc: ReportData) => {
    const role = userRole?.toLowerCase() || '';
    const status = (doc.status || '').toLowerCase();
    
    // Admin and Manager roles have full access to view/edit
    if (role === 'admin' || role === 'manager') return true;
    
    // Identify user role groups
    const isReviewer = role.includes('reviewer') || role === 'reviewer';
    const isApprover = role.includes('approver') || role === 'approver';
    const isPreparator = role === 'preparator' || role === 'requestor';
    
    // 1. Reviewers - Only enable edit when status is "submitted", "resubmitted", "reviewed", or "rejected"
    if (isReviewer) {
      return ['submitted', 'resubmitted', 'reviewed', 'rejected'].includes(status);
    }
    
    // 2. Approvers - Only enable edit when status is "reviewed" or "approved"
    if (isApprover) {
      return ['reviewed', 'approved'].includes(status);
    }
    
    // 2. Preparator can edit their own drafts or documents sent back for revision
    if (isPreparator) {
      return ['pending', 'needs-revision'].includes(status);
    }

    // Default fallback
    return true;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handlePreview = (report: ReportData) => {
    onPreviewDocument(report.id);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleViewWorkflow = (report: ReportData) => {
    setSelectedDocument(report);
    setWorkflowDialogOpen(true);
  };

  const handlePublish = (report: ReportData) => {
    if (report.status !== 'approved') {
      toast.error('Only approved documents can be published');
      return;
    }
    
    if (onPublishDocument) {
      onPublishDocument(report.id);
    }
    
    toast.success(`Document "${report.fileName}" has been published successfully!`);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterDocumentType('all');
    setFilterDepartment('all');
    setFilterProduct('all');
    setFilterSite('all');
    setFilterStatus('all');
    setFilterDateRange('all');
  };

  const activeFilterCount = [
    filterDocumentType !== 'all',
    filterDepartment !== 'all',
    filterProduct !== 'all',
    filterSite !== 'all',
    filterStatus !== 'all',
    filterDateRange !== 'all'
  ].filter(Boolean).length;

  // Handler functions for enhanced features
  const toggleDocumentSelection = (docId: string) => {
    const newSelection = new Set(selectedDocuments);
    if (newSelection.has(docId)) {
      newSelection.delete(docId);
    } else {
      newSelection.add(docId);
    }
    setSelectedDocuments(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.size === sortedDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(sortedDocuments.map(d => d.id)));
    }
  };

  const toggleFavorite = (docId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(docId)) {
      newFavorites.delete(docId);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(docId);
      toast.success('Added to favorites');
    }
    setFavorites(newFavorites);
  };

  const handleBulkDownload = () => {
    const docs = sortedDocuments.filter(d => selectedDocuments.has(d.id));
    docs.forEach(doc => {
      onDownloadDocument(doc.id, doc.fileName);
    });
    toast.success(`Downloading ${docs.length} document(s)`);
    setSelectedDocuments(new Set());
  };

  const handleBulkDelete = () => {
    const docs = sortedDocuments.filter(d => selectedDocuments.has(d.id));
    if (confirm(`Are you sure you want to delete ${docs.length} document(s)?`)) {
      docs.forEach(doc => {
        onDeleteReport(doc.id);
      });
      toast.success(`Deleted ${docs.length} document(s)`);
      setSelectedDocuments(new Set());
    }
  };

  const handleRename = (doc: ReportData) => {
    setRenamingDocument(doc);
    setNewFileName(doc.fileName);
    setRenameDialogOpen(true);
  };

  const confirmRename = () => {
    if (renamingDocument && newFileName.trim()) {
      toast.success(`Renamed "${renamingDocument.fileName}" to "${newFileName}"`);
      setRenameDialogOpen(false);
      setRenamingDocument(null);
      setNewFileName('');
    }
  };

  const handleAddTags = (doc: ReportData) => {
    setRenamingDocument(doc);
    setNewTags((documentTags[doc.id] || []).join(', '));
    setTagDialogOpen(true);
  };

  const confirmAddTags = () => {
    if (renamingDocument) {
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      setDocumentTags({
        ...documentTags,
        [renamingDocument.id]: tags
      });
      toast.success(`Updated tags for "${renamingDocument.fileName}"`);
      setTagDialogOpen(false);
      setRenamingDocument(null);
      setNewTags('');
    }
  };

  const handleShareDocument = (doc: ReportData) => {
    setSelectedDocument(doc);
    setShareDialogOpen(true);
  };

  const confirmShare = () => {
    toast.success(`Share link copied to clipboard!`);
    setShareDialogOpen(false);
  };

  // Recent documents (last 5 modified)
  const recentDocuments = useMemo(() => {
    return [...allDocuments]
      .sort((a, b) => {
        const dateA = new Date(a.lastModified || a.uploadDate || 0).getTime();
        const dateB = new Date(b.lastModified || b.uploadDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [allDocuments]);

  // Render folder tree
  const renderFolderTree = (node: FolderNode, level: number = 0): React.ReactNode => {
    if (node.type === 'document') {
      // Check if document matches current filters
      if (!filteredDocuments.find(d => d.id === node.document?.id)) {
        return null;
      }

      const doc = node.document!;
      return (
        <div
          key={node.id}
          className="flex items-center gap-2 py-2 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all group"
          style={{ paddingLeft: `${(level + 1) * 24}px` }}
        >
          <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{doc.fileName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {doc.documentType || 'Template'}
              </Badge>
              <Badge className={`${getStatusColor(doc.status)} text-xs`}>
                {getStatusLabel(doc.status)}
              </Badge>
              {doc.requestId && (
                <span className="text-xs text-slate-500">ID: {doc.requestId}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreview(doc)}
              className="h-8 w-8 p-0"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!canUserEdit(doc)}
              onClick={() => onViewForm(doc.id)}
              className={`h-8 w-8 p-0 ${!canUserEdit(doc) ? 'text-slate-300' : ''}`}
              title={!canUserEdit(doc) ? "Pending current workflow step" : "Edit Details"}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownloadDocument(doc.id, doc.fileName)}
              className="h-8 w-8 p-0"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            {(userRole === 'admin' || userRole === 'manager') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  doc.status === 'approved' && handlePublish(doc);
                }}
                className={`h-8 w-8 p-0 ${
                  doc.status === 'approved'
                    ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                    : 'text-slate-300'
                }`}
                title={doc.status === 'approved' ? 'Publish' : 'Only approved documents can be published'}
                disabled={doc.status !== 'approved'}
              >
                <UploadCloud className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      );
    }

    // Filter out empty folders
    const visibleChildren = node.children?.filter(child => {
      if (child.type === 'document') {
        return filteredDocuments.find(d => d.id === child.document?.id);
      }
      return true;
    });

    if (!visibleChildren || visibleChildren.length === 0) {
      return null;
    }

    const isExpanded = expandedFolders.has(node.id);
    const Icon = isExpanded ? FolderOpen : Folder;
    const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          style={{ paddingLeft: `${level * 24}px` }}
          onClick={() => toggleFolder(node.id)}
        >
          <ChevronIcon className="h-4 w-4 text-slate-400" />
          <Icon className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-slate-700">{node.name}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {visibleChildren.filter(c => c.type === 'document').length +
             visibleChildren.reduce((acc, c) => 
               acc + (c.children?.filter(cc => cc.type === 'document').length || 0), 0)}
          </Badge>
        </div>
        {isExpanded && (
          <div>
            {visibleChildren.map(child => renderFolderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Statistics
  const stats = {
    total: allDocuments.length,
    filtered: filteredDocuments.length,
    approved: filteredDocuments.filter(r => r.status === 'approved').length,
    pending: filteredDocuments.filter(r => 
      ['pending', 'submitted', 'initial-review', 'review-process'].includes(r.status)
    ).length,
    rejected: filteredDocuments.filter(r => r.status === 'rejected').length
  };

  const isReviewerRole = (userRole || '').toLowerCase().includes('reviewer');
  const isApproverRole = (userRole || '').toLowerCase().includes('approver');
  const isProcessRole = isReviewerRole || isApproverRole;

  return (
    <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', gap: (isProcessRole || userRole === 'requestor') ? '1rem' : '1.5rem' }}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {isProcessRole ? 'All Reports' : 'Document Library'}
            </h1>
            {!isProcessRole && userRole !== 'requestor' && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full border border-blue-500/30">
                <FolderTree className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Hierarchical Storage</span>
              </div>
            )}
          </div>
          {isProcessRole ? (
            <p className="text-slate-600 text-sm">{sortedDocuments.length} reports found</p>
          ) : (
            <p className="text-slate-600">
              Centralized document repository with metadata classification and advanced search
            </p>
          )}
        </div>
        {!isProcessRole && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tree')}
              className="gap-2"
            >
              <FolderTree className="h-4 w-4" />
              Tree
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Table
            </Button>
            <div className="w-px bg-slate-300 mx-1" />
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm border border-blue-200/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-blue-600 font-medium">Total Documents</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-700">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border border-purple-200/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-purple-600 font-medium">Filtered Results</CardDescription>
            <CardTitle className="text-3xl font-bold text-purple-700">{stats.filtered}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-emerald-600 font-medium">Approved</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-700">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 backdrop-blur-sm border border-amber-200/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-amber-600 font-medium">Pending</CardDescription>
            <CardTitle className="text-3xl font-bold text-amber-700">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-red-50/80 to-rose-50/80 backdrop-blur-sm border border-red-200/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription className="text-red-600 font-medium">Rejected</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-700">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recently Submitted Requests Section - Only for Admin/Manager */}
      {(userRole === 'admin' || userRole === 'manager') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
              Recently Submitted Requests
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setViewMode('table')} className="text-blue-600">
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentDocuments
              .filter(doc => doc.documentType === 'Request')
              .slice(0, 3)
              .map(doc => (
                <Card key={`recent-${doc.id}`} className="hover:shadow-md transition-all border-blue-100 bg-white/50 backdrop-blur-sm group">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <ImageWithFallback 
                          src={getThumbnail(doc.id)} 
                          alt={doc.fileName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate mb-1">{doc.fileName}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(doc.status)} text-[10px] px-1.5 py-0`}>
                            {getStatusLabel(doc.status)}
                          </Badge>
                          <span className="text-[10px] text-slate-500 font-mono">{doc.requestId}</span>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {doc.lastModified || doc.uploadDate}
                          </span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handlePreview(doc)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onViewForm(doc.id)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {recentDocuments.filter(doc => doc.documentType === 'Request').length === 0 && (
              <div className="md:col-span-3 py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm">No recent requests submitted yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card className={userRole === 'requestor' ? "border shadow-md" : "border-0 shadow-lg"}>
        {(!isProcessRole && userRole !== 'requestor') && (
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Advanced Search & Filters</CardTitle>
                  <CardDescription>
                    Filter documents by metadata, status, and date range
                  </CardDescription>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All ({activeFilterCount})
                </Button>
              )}
            </div>
          </CardHeader>
        )}
        
        {/* Reviewer-specific simplified filter bar */}
        {isProcessRole && (
          <CardHeader className="bg-white py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm border-slate-300"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-9 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="initial-review">Initial Review</SelectItem>
                  <SelectItem value="review-process">Review Process</SelectItem>
                  <SelectItem value="final-review">Final Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="supply-chain">Supply Chain</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="quality-assurance">Quality Assurance</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Export Menu */}
              <Select>
                <SelectTrigger className="w-32 h-9 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-md">
                  <div className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    <SelectValue placeholder="Export" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="excel">Export to Excel</SelectItem>
                  <SelectItem value="pdf">Export to PDF</SelectItem>
                  <SelectItem value="csv">Export to CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        )}
        
        {/* CardContent - Only render for non-reviewers */}
        {!isProcessRole && (
        <CardContent className={userRole === 'requestor' ? 'pt-4 pb-4' : 'pt-6'}>
          {/* Search Bar - Only for non-reviewers */}
            <div className={userRole === 'requestor' ? "relative mb-4" : "relative mb-6"}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Full-text search across all documents, metadata, and properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base border-slate-300 focus:border-blue-500"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

          {/* Metadata Filters - Only for non-reviewers */}
            <>
            <div className={userRole === 'requestor' ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3" : "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"}>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1">
                <FileType className="h-3 w-3" />
                Document Type
              </label>
              <Select value={filterDocumentType} onValueChange={setFilterDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Department
              </label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {departmentFilterOptions.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1">
                <Package className="h-3 w-3" />
                Product
              </label>
              <Select value={filterProduct} onValueChange={setFilterProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {products.map(prod => (
                    <SelectItem key={prod} value={prod}>
                      {prod === 'all' ? 'All Products' : prod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Site
              </label>
              <Select value={filterSite} onValueChange={setFilterSite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {sites.map(site => (
                    <SelectItem key={site} value={site}>
                      {site === 'all' ? 'All Sites' : site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="initial-review">Initial Review</SelectItem>
                  <SelectItem value="review-process">Review Process</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date Range
              </label>
              <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Controls - Hidden for Preparator/Requestor */}
          {(userRole === 'admin' || userRole === 'manager') && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <span className="text-sm font-semibold text-slate-600">Sort by:</span>
              <div className="flex gap-2">
                {(['name', 'date', 'type', 'status'] as SortField[]).map(field => (
                  <Button
                    key={field}
                    variant={sortField === field ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (sortField === field) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortField(field);
                        setSortOrder('asc');
                      }
                    }}
                    className="gap-2 capitalize"
                  >
                    {field}
                    {sortField === field && (
                      sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
          </>
        </CardContent>
        )}
      </Card>

      {/* Recent Documents Quick Access - Only for Admin/Manager */}
      {recentDocuments.length > 0 && (userRole === 'admin' || userRole === 'manager') && (
        <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Recent Documents</CardTitle>
              <Badge variant="outline" className="ml-auto">
                Last 5 Modified
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentDocuments.map(doc => (
                <Card
                  key={doc.id}
                  className="min-w-[200px] flex-shrink-0 hover:shadow-lg transition-all cursor-pointer border-blue-200"
                  onClick={() => handlePreview(doc)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="p-1.5 rounded bg-blue-100">
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(doc.id);
                        }}
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            favorites.has(doc.id)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-400'
                          }`}
                        />
                      </Button>
                    </div>
                    <p className="text-xs font-medium text-slate-800 line-clamp-2 mb-1" title={doc.fileName}>
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(doc.lastModified || doc.uploadDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedDocuments.size > 0 && (
        <Card className="border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-xl">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-slate-800">
                    {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocuments(new Set())}
                  className="gap-1 text-slate-600 hover:text-slate-800"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                  className="gap-2 bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const docs = sortedDocuments.filter(d => selectedDocuments.has(d.id));
                    if (docs.length > 0) {
                      setRenamingDocument(docs[0]);
                      setTagDialogOpen(true);
                    }
                  }}
                  className="gap-2 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                >
                  <Tag className="h-4 w-4" />
                  Add Tags
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="gap-2 bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Display */}
      <Card className={userRole === 'requestor' ? "border shadow-md" : "border-0 shadow-lg"}>
        {(userRole !== 'manager_reviewer' && userRole !== 'manager_approver' && userRole !== 'approver' && userRole !== 'requestor') && (
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                  {viewMode === 'tree' ? <FolderTree className="h-4 w-4 text-white" /> :
                   viewMode === 'grid' ? <Grid3x3 className="h-4 w-4 text-white" /> :
                   <List className="h-4 w-4 text-white" />}
                </div>
                <div>
                  {(userRole === 'admin' || userRole === 'manager') && (
                    <>
                      <CardTitle className="text-lg">
                        {viewMode === 'tree' ? 'Folder Hierarchy' :
                         viewMode === 'grid' ? 'Grid View' : 'Table View'}
                      </CardTitle>
                      <CardDescription>
                        {stats.filtered} document{stats.filtered !== 1 ? 's' : ''} found
                      </CardDescription>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className={(userRole === 'manager_reviewer' || userRole === 'manager_approver' || userRole === 'approver') ? 'p-0' : (userRole === 'requestor' ? 'p-4' : 'p-6')}>
          {sortedDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-slate-100 inline-block mb-4">
                <FileText className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No documents found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <>
              {/* Tree View - Hidden for reviewers */}
              {viewMode === 'tree' && userRole !== 'manager_reviewer' && userRole !== 'manager_approver' && userRole !== 'approver' && (
                <div className="space-y-1">
                  {renderFolderTree(folderHierarchy)}
                </div>
              )}

              {/* Grid View - Hidden for reviewers */}
              {viewMode === 'grid' && userRole !== 'manager_reviewer' && userRole !== 'manager_approver' && userRole !== 'approver' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedDocuments.map(doc => (
                    <Card key={doc.id} className="group hover:shadow-xl transition-all border border-slate-200 relative overflow-hidden">
                      {/* Document Preview Thumbnail */}
                      <div className="h-32 w-full overflow-hidden border-b border-slate-100 relative group-hover:opacity-95 transition-opacity">
                        <ImageWithFallback 
                          src={getThumbnail(doc.id)} 
                          alt={doc.fileName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                        <div className="absolute top-2 right-2">
                          <Badge className={getStatusColor(doc.status)}>
                            {getStatusLabel(doc.status)}
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="pb-3 pt-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedDocuments.has(doc.id)}
                              onCheckedChange={() => toggleDocumentSelection(doc.id)}
                            />
                            <div className="p-1.5 rounded bg-blue-50">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => toggleFavorite(doc.id)}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  favorites.has(doc.id)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-300 hover:text-yellow-400'
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-sm line-clamp-2 mt-2" title={doc.fileName}>
                          {doc.fileName}
                        </CardTitle>
                        {documentTags[doc.id] && documentTags[doc.id].length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {documentTags[doc.id].slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-slate-600">
                            <FileType className="h-3 w-3" />
                            <span>{doc.documentType || 'Template'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Building2 className="h-3 w-3" />
                            <span>{doc.department}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Package className="h-3 w-3" />
                            <span>{doc.product || 'General'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(doc.lastModified || doc.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(doc)}
                            className="flex-1 gap-1 text-xs text-blue-600 border-blue-100 hover:bg-blue-50"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canUserEdit(doc)}
                            onClick={() => onViewForm(doc.id)}
                            className={`flex-1 gap-1 text-xs border-indigo-100 hover:bg-indigo-50 ${!canUserEdit(doc) ? 'text-slate-300' : 'text-indigo-600'}`}
                            title={!canUserEdit(doc) ? "Pending current workflow step" : "Edit"}
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem onClick={() => onDownloadDocument(doc.id, doc.fileName)} className="gap-2 cursor-pointer">
                                <Download className="h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              {(userRole === 'admin' || userRole === 'manager') && (
                                <DropdownMenuItem 
                                  onClick={() => doc.status === 'approved' && handlePublish(doc)} 
                                  className={`gap-2 cursor-pointer ${doc.status !== 'approved' ? 'opacity-50 grayscale' : 'text-purple-600 font-medium'}`}
                                  disabled={doc.status !== 'approved'}
                                >
                                  <UploadCloud className="h-4 w-4" />
                                  Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleRename(doc)} className="gap-2 cursor-pointer">
                                <Edit2 className="h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddTags(doc)} className="gap-2 cursor-pointer">
                                <Tag className="h-4 w-4" />
                                Manage Tags
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShareDocument(doc)} className="gap-2 cursor-pointer">
                                <Share2 className="h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onDeleteReport(doc.id)} className="gap-2 cursor-pointer text-red-600">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Table View - Always shown for reviewers and preparators, otherwise based on viewMode */}
              {(viewMode === 'table' || userRole === 'manager_reviewer' || userRole === 'manager_approver' || userRole === 'approver' || userRole === 'preparator') && (
                <div className="overflow-x-auto bg-white rounded-lg">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('id')}>
                          <div className="flex items-center gap-1">
                            Request ID
                            {sortField === 'id' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('name')}>
                          <div className="flex items-center gap-1">
                            Document Name
                            {sortField === 'name' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('department')}>
                          <div className="flex items-center gap-1">
                            Department
                            {sortField === 'department' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('status')}>
                          <div className="flex items-center gap-1">
                            Status
                            {sortField === 'status' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                          Workflow
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('size')}>
                          <div className="flex items-center gap-1">
                            File Size
                            {sortField === 'size' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('date')}>
                          <div className="flex items-center gap-1">
                            Upload Date
                            {sortField === 'date' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('assignedTo')}>
                          <div className="flex items-center gap-1">
                            Assigned To
                            {sortField === 'assignedTo' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('lastModified')}>
                          <div className="flex items-center gap-1">
                            Last Modified
                            {sortField === 'lastModified' ? (
                              sortOrder === 'asc' ? <SortAsc className="h-3 w-3 text-blue-600" /> : <SortDesc className="h-3 w-3 text-blue-600" />
                            ) : (
                              <SortDesc className="h-3 w-3 text-slate-300" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">
                          Audit Logs
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors border-0 outline-none focus-within:outline-none">
                          {/* Request ID */}
                          <td className="px-4 py-3">
                            {doc.documentType === 'Template' ? (
                              <Badge variant="outline" className="text-[10px] font-mono border-slate-300 text-slate-500 bg-slate-50">
                                {doc.requestId}
                              </Badge>
                            ) : (
                              <button 
                                onClick={() => onViewForm(doc.id)}
                                disabled={!canUserEdit(doc)}
                                className={`text-sm font-medium outline-none focus:outline-none ${
                                  !canUserEdit(doc)
                                    ? 'text-slate-400 cursor-not-allowed'
                                    : 'text-blue-600 hover:text-blue-800 hover:underline'
                                }`}
                                title={!canUserEdit(doc) ? "Pending current workflow step" : ""}
                              >
                                {doc.requestId || doc.id.slice(0, 8).toUpperCase()}
                              </button>
                            )}
                          </td>
                          
                          {/* Document Name */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-700">{doc.fileName}</span>
                          </td>
                          
                          {/* Department */}
                          <td className="px-4 py-3">
                            <Badge className="bg-cyan-100 text-cyan-700 hover:bg-cyan-100 border-0 text-xs">
                              {doc.department}
                            </Badge>
                          </td>
                          
                          {/* Status */}
                          <td className="px-4 py-3">
                            <Badge className={getStatusColor(doc.status)}>
                              {getStatusLabel(doc.status)}
                            </Badge>
                          </td>
                          
                          {/* Workflow Icon */}
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewWorkflow(doc)}
                              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                              title="View Workflow"
                            >
                              <GitBranch className="h-4 w-4" />
                            </Button>
                          </td>
                          
                          {/* File Size */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <span className="text-blue-600 font-medium">
                                {formatFileSize(doc.fileSize)}
                              </span>
                            </div>
                          </td>
                          
                          {/* Upload Date */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {new Date(doc.uploadDate).toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'})}
                            </div>
                          </td>
                          
                          {/* Assigned To */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <User className="h-4 w-4 text-slate-400" />
                              {doc.assignedToName || doc.assignedTo || 'Unassigned'}
                            </div>
                          </td>
                          
                          {/* Last Modified */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="h-4 w-4 text-slate-400" />
                              {new Date(doc.lastModified || doc.uploadDate).toLocaleDateString('en-US', {year: 'numeric', month: '2-digit', day: '2-digit'})} {new Date(doc.lastModified || doc.uploadDate).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})}
                            </div>
                          </td>
                          
                          {/* Audit Logs */}
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onNavigate && onNavigate('activity-log-detail', { requestId: doc.requestId || doc.id })}
                              className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800"
                              title="View Audit Logs"
                            >
                              <ScrollText className="h-4 w-4" />
                            </Button>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {/* Preview Icon - Replacing View */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreview(doc)}
                                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="Preview Document"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {/* Edit details Icon */}
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!canUserEdit(doc)}
                                onClick={() => onViewForm(doc.id)}
                                className={`h-7 w-7 p-0 rounded ${!canUserEdit(doc) ? 'text-slate-300' : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50'}`}
                                title={!canUserEdit(doc) ? "Pending current workflow step" : "Open in Form Editor"}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              
                              {/* Document Publishing Icon - Admin and Manager roles */}
                              {(userRole === 'admin' || userRole === 'manager') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => doc.status === 'approved' && handlePublish(doc)}
                                  className={`h-7 w-7 p-0 rounded ${
                                    doc.status === 'approved'
                                      ? 'text-purple-600 hover:text-purple-800 hover:bg-purple-50 cursor-pointer'
                                      : 'text-gray-300 cursor-not-allowed'
                                  }`}
                                  title={doc.status === 'approved' ? 'Publish' : 'Only approved documents can be published'}
                                  disabled={doc.status !== 'approved'}
                                >
                                  <UploadCloud className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {/* Download Icon */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => alert(`Downloading ${doc.fileName}...`)}
                                className="h-7 w-7 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              
                              {/* Delete Icon - Hidden for Manager role */}
                              {userRole !== 'manager' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete ${doc.fileName}?`)) {
                                      alert(`Deleting ${doc.fileName}...`);
                                    }
                                  }}
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                      <div className="text-sm text-slate-600 font-medium">
                        Showing {startIndex + 1} to {Math.min(endIndex, sortedDocuments.length)} of {sortedDocuments.length} documents
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="gap-2 border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-4 w-4 rotate-180" />
                          Previous
                        </Button>
                        
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            // Show first page, last page, current page, and pages around current
                            const showPage = page === 1 || 
                                           page === totalPages || 
                                           (page >= currentPage - 1 && page <= currentPage + 1);
                            
                            const showEllipsis = (page === currentPage - 2 && currentPage > 3) ||
                                               (page === currentPage + 2 && currentPage < totalPages - 2);
                            
                            if (showEllipsis) {
                              return <span key={page} className="px-2 text-slate-400">...</span>;
                            }
                            
                            if (!showPage) return null;
                            
                            return (
                              <Button
                                key={page}
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={currentPage === page 
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-md" 
                                  : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"}
                              >
                                {page}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="gap-2 border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Workflow Dialog */}
      {selectedDocument && (
        <WorkflowDialog
          isOpen={workflowDialogOpen}
          onClose={() => setWorkflowDialogOpen(false)}
          report={selectedDocument}
        />
      )}

      {/* Document Preview Screen Link is handled by handlePreview navigation */}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Upload Document
            </DialogTitle>
            <DialogDescription>
              Upload a new document to the library. Supported formats: .xlsx, .docx, .pdf
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-50">
              <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-slate-500">
                XLSX, DOCX, PDF (max 10MB)
              </p>
            </div>
            <div>
              <Label>Department</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="quality">Quality Assurance</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="procurement">Procurement</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="regulatory">Regulatory Affairs</SelectItem>
                  <SelectItem value="supply-chain">Supply Chain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-blue-600" />
              Rename Document
            </DialogTitle>
            <DialogDescription>
              Enter a new name for the document
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>File Name</Label>
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tags Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              Manage Tags
            </DialogTitle>
            <DialogDescription>
              Add tags to organize and categorize documents (comma-separated)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Tags</Label>
            <Textarea
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="e.g., urgent, reviewed, archived"
              className="mt-2"
              rows={3}
            />
            <p className="text-xs text-slate-500 mt-2">
              Separate multiple tags with commas
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAddTags} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Share Document
            </DialogTitle>
            <DialogDescription>
              Share this document with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Document Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={selectedDocument ? `https://docs.example.com/view/${selectedDocument.id}` : ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={confirmShare}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Share Link</p>
                  <p>Anyone with this link can view the document. Make sure you have the necessary permissions before sharing.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});