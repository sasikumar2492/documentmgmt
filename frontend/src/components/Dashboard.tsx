import React from 'react';
import { Button } from './ui/button';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Network, 
  Layers, 
  UsersIcon, 
  FileStack,
  PlayCircle,
  X as XIcon,
  AlertTriangle,
  Filter,
  TrendingUp,
  TrendingDown,
  FileCheck,
  FileClock,
  FileX,
  FolderOpen,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TemplateData, ReportData, ViewType } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/statusUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  templates: TemplateData[];
  reports: ReportData[];
  onNavigate: (view: ViewType) => void;
}

export const Dashboard: React.FC<DashboardProps> = (({
  templates = [],
  reports = [],
  onNavigate
}) => {
  const [activeTab, setActiveTab] = React.useState<'division' | 'sections' | 'group' | 'records'>('division');
  const [dateFilter, setDateFilter] = React.useState<'week' | 'month' | 'year' | 'custom'>('month');
  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  const [summaryFilter, setSummaryFilter] = React.useState<'week' | 'month' | 'year' | 'all'>('month');
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);
  const [showYearDropdown, setShowYearDropdown] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState('January');
  const [selectedYear, setSelectedYear] = React.useState('2024');
  const [currentPage, setCurrentPage] = React.useState(1);
  const recordsPerPage = 5;

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = ['2024', '2023', '2022', '2021', '2020'];

  // Sample data for pending records - Division
  const pendingRecordsDivision = [
    { id: 1, name: 'Part Approval - Brake Assembly', class: 'New Part', dueDate: '20.05.2024', owner: 'John Smith' },
    { id: 2, name: 'Manufacturer Change - Engine Component', class: 'Modification', dueDate: '16.04.2024', owner: 'Sarah Johnson' },
    { id: 3, name: 'Alternative Supplier - Hydraulic Pump', class: 'New Manufacturer', dueDate: '13.04.2024', owner: 'Mike Chen' },
    { id: 4, name: 'Part Approval - Electronic Control Unit', class: 'New Part', dueDate: '04.02.2024', owner: 'Lisa Anderson' },
    { id: 5, name: 'Supplier Qualification - Transmission Parts', class: 'New Manufacturer', dueDate: '28.01.2024', owner: 'David Lee' },
    { id: 6, name: 'Part Modification - Cooling System', class: 'Modification', dueDate: '22.01.2024', owner: 'Emma Wilson' },
    { id: 7, name: 'New Part Request - Steering Column', class: 'New Part', dueDate: '15.01.2024', owner: 'James Brown' },
    { id: 8, name: 'Manufacturer Audit - Supplier B', class: 'New Manufacturer', dueDate: '10.01.2024', owner: 'Olivia Davis' },
    { id: 9, name: 'Part Approval - Fuel Injection', class: 'New Part', dueDate: '05.01.2024', owner: 'William Garcia' },
    { id: 10, name: 'Supplier Review - Electrical Components', class: 'Modification', dueDate: '28.12.2023', owner: 'Sophia Martinez' },
    { id: 11, name: 'Part Change - Exhaust System', class: 'Modification', dueDate: '20.12.2023', owner: 'Robert Taylor' },
    { id: 12, name: 'New Manufacturer - Suspension Parts', class: 'New Manufacturer', dueDate: '15.12.2023', owner: 'Jennifer White' },
  ];

  // Sample data for pending records - Sections
  const pendingRecordsSections = [
    { id: 1, name: 'Quality Testing - Brake Pads', class: 'Section A', dueDate: '22.05.2024', owner: 'QA Team' },
    { id: 2, name: 'Material Specification Review', class: 'Section B', dueDate: '18.04.2024', owner: 'Engineering' },
    { id: 3, name: 'Cost Analysis - New Supplier', class: 'Section C', dueDate: '15.04.2024', owner: 'Finance' },
    { id: 4, name: 'Compliance Check - ECU Module', class: 'Section D', dueDate: '10.02.2024', owner: 'Compliance' },
    { id: 5, name: 'Performance Testing - Transmission', class: 'Section A', dueDate: '05.02.2024', owner: 'QA Team' },
    { id: 6, name: 'Material Analysis - Composite Parts', class: 'Section B', dueDate: '30.01.2024', owner: 'Engineering' },
    { id: 7, name: 'Budget Review - Manufacturing', class: 'Section C', dueDate: '25.01.2024', owner: 'Finance' },
    { id: 8, name: 'Safety Compliance - Airbags', class: 'Section D', dueDate: '20.01.2024', owner: 'Compliance' },
    { id: 9, name: 'Quality Audit - Chassis Parts', class: 'Section A', dueDate: '15.01.2024', owner: 'QA Team' },
    { id: 10, name: 'Design Review - Body Panels', class: 'Section B', dueDate: '10.01.2024', owner: 'Engineering' },
    { id: 11, name: 'Cost Optimization - Procurement', class: 'Section C', dueDate: '05.01.2024', owner: 'Finance' },
    { id: 12, name: 'Regulatory Compliance - Emissions', class: 'Section D', dueDate: '28.12.2023', owner: 'Compliance' },
  ];

  // Sample data for pending records - Group
  const pendingRecordsGroup = [
    { id: 1, name: 'Group Review - Automotive Parts', class: 'Group 1', dueDate: '25.05.2024', owner: 'Lead Engineer' },
    { id: 2, name: 'Supplier Group Assessment', class: 'Group 2', dueDate: '20.04.2024', owner: 'Procurement Lead' },
    { id: 3, name: 'Manufacturing Group Review', class: 'Group 3', dueDate: '17.04.2024', owner: 'Mfg Manager' },
    { id: 4, name: 'Quality Group Audit', class: 'Group 4', dueDate: '08.02.2024', owner: 'QA Lead' },
    { id: 5, name: 'Engineering Group Discussion', class: 'Group 1', dueDate: '02.02.2024', owner: 'Lead Engineer' },
    { id: 6, name: 'Vendor Group Evaluation', class: 'Group 2', dueDate: '28.01.2024', owner: 'Procurement Lead' },
    { id: 7, name: 'Production Group Meeting', class: 'Group 3', dueDate: '22.01.2024', owner: 'Mfg Manager' },
    { id: 8, name: 'Inspection Group Review', class: 'Group 4', dueDate: '18.01.2024', owner: 'QA Lead' },
    { id: 9, name: 'Design Group Workshop', class: 'Group 1', dueDate: '12.01.2024', owner: 'Lead Engineer' },
    { id: 10, name: 'Supply Chain Group Analysis', class: 'Group 2', dueDate: '08.01.2024', owner: 'Procurement Lead' },
    { id: 11, name: 'Assembly Group Planning', class: 'Group 3', dueDate: '03.01.2024', owner: 'Mfg Manager' },
    { id: 12, name: 'Testing Group Strategy', class: 'Group 4', dueDate: '29.12.2023', owner: 'QA Lead' },
  ];

  // Sample data for pending records - Records
  const pendingRecordsRecords = [
    { id: 1, name: 'Record #2024-001 - Part Database', class: 'Database', dueDate: '28.05.2024', owner: 'Data Admin' },
    { id: 2, name: 'Record #2024-002 - Vendor Registry', class: 'Registry', dueDate: '23.04.2024', owner: 'Vendor Mgmt' },
    { id: 3, name: 'Record #2024-003 - Audit Trail', class: 'Audit', dueDate: '19.04.2024', owner: 'Compliance' },
    { id: 4, name: 'Record #2024-004 - Change Log', class: 'Change Mgmt', dueDate: '12.02.2024', owner: 'Admin' },
    { id: 5, name: 'Record #2024-005 - Quality Reports', class: 'Database', dueDate: '08.02.2024', owner: 'Data Admin' },
    { id: 6, name: 'Record #2024-006 - Supplier Contacts', class: 'Registry', dueDate: '02.02.2024', owner: 'Vendor Mgmt' },
    { id: 7, name: 'Record #2024-007 - Compliance Logs', class: 'Audit', dueDate: '28.01.2024', owner: 'Compliance' },
    { id: 8, name: 'Record #2024-008 - Modification History', class: 'Change Mgmt', dueDate: '22.01.2024', owner: 'Admin' },
    { id: 9, name: 'Record #2024-009 - Inventory Database', class: 'Database', dueDate: '18.01.2024', owner: 'Data Admin' },
    { id: 10, name: 'Record #2024-010 - Partner Registry', class: 'Registry', dueDate: '12.01.2024', owner: 'Vendor Mgmt' },
    { id: 11, name: 'Record #2024-011 - Inspection Audit', class: 'Audit', dueDate: '08.01.2024', owner: 'Compliance' },
    { id: 12, name: 'Record #2024-012 - Update Changelog', class: 'Change Mgmt', dueDate: '03.01.2024', owner: 'Admin' },
  ];

  // Record summary data for donut chart - Division
  const recordSummaryDivision = [
    { name: 'Approved', value: 240, color: '#10b981' },
    { name: 'Pending', value: 120, color: '#fbbf24' },
    { name: 'Rejected', value: 120, color: '#ef4444' },
  ];

  // Record summary data - Sections
  const recordSummarySections = [
    { name: 'Approved', value: 180, color: '#10b981' },
    { name: 'Pending', value: 90, color: '#fbbf24' },
    { name: 'Rejected', value: 90, color: '#ef4444' },
  ];

  // Record summary data - Group
  const recordSummaryGroup = [
    { name: 'Approved', value: 200, color: '#10b981' },
    { name: 'Pending', value: 100, color: '#fbbf24' },
    { name: 'Rejected', value: 80, color: '#ef4444' },
  ];

  // Record summary data - Records
  const recordSummaryRecords = [
    { name: 'Approved', value: 300, color: '#10b981' },
    { name: 'Pending', value: 150, color: '#fbbf24' },
    { name: 'Rejected', value: 100, color: '#ef4444' },
  ];

  // Record summary data - WEEK VIEW - Division
  const recordSummaryDivisionWeek = [
    { name: 'Approved', value: 60, color: '#10b981' },
    { name: 'Pending', value: 30, color: '#fbbf24' },
    { name: 'Rejected', value: 30, color: '#ef4444' },
  ];

  // Record summary data - YEAR VIEW - Division
  const recordSummaryDivisionYear = [
    { name: 'Approved', value: 2880, color: '#10b981' },
    { name: 'Pending', value: 1440, color: '#fbbf24' },
    { name: 'Rejected', value: 1440, color: '#ef4444' },
  ];

  // Record summary data - ALL TIME - Division
  const recordSummaryDivisionAll = [
    { name: 'Approved', value: 5000, color: '#10b981' },
    { name: 'Pending', value: 2500, color: '#fbbf24' },
    { name: 'Rejected', value: 2000, color: '#ef4444' },
  ];

  // Record summary data - WEEK VIEW - Sections
  const recordSummarySectionsWeek = [
    { name: 'Approved', value: 45, color: '#10b981' },
    { name: 'Pending', value: 23, color: '#fbbf24' },
    { name: 'Rejected', value: 23, color: '#ef4444' },
  ];

  // Record summary data - YEAR VIEW - Sections
  const recordSummarySectionsYear = [
    { name: 'Approved', value: 2160, color: '#10b981' },
    { name: 'Pending', value: 1080, color: '#fbbf24' },
    { name: 'Rejected', value: 1080, color: '#ef4444' },
  ];

  // Record summary data - ALL TIME - Sections
  const recordSummarySectionsAll = [
    { name: 'Approved', value: 4000, color: '#10b981' },
    { name: 'Pending', value: 2000, color: '#fbbf24' },
    { name: 'Rejected', value: 1800, color: '#ef4444' },
  ];

  // Record summary data - WEEK VIEW - Group
  const recordSummaryGroupWeek = [
    { name: 'Approved', value: 50, color: '#10b981' },
    { name: 'Pending', value: 25, color: '#fbbf24' },
    { name: 'Rejected', value: 20, color: '#ef4444' },
  ];

  // Record summary data - YEAR VIEW - Group
  const recordSummaryGroupYear = [
    { name: 'Approved', value: 2400, color: '#10b981' },
    { name: 'Pending', value: 1200, color: '#fbbf24' },
    { name: 'Rejected', value: 960, color: '#ef4444' },
  ];

  // Record summary data - ALL TIME - Group
  const recordSummaryGroupAll = [
    { name: 'Approved', value: 4500, color: '#10b981' },
    { name: 'Pending', value: 2200, color: '#fbbf24' },
    { name: 'Rejected', value: 1600, color: '#ef4444' },
  ];

  // Record summary data - WEEK VIEW - Records
  const recordSummaryRecordsWeek = [
    { name: 'Approved', value: 75, color: '#10b981' },
    { name: 'Pending', value: 38, color: '#fbbf24' },
    { name: 'Rejected', value: 25, color: '#ef4444' },
  ];

  // Record summary data - YEAR VIEW - Records
  const recordSummaryRecordsYear = [
    { name: 'Approved', value: 3600, color: '#10b981' },
    { name: 'Pending', value: 1800, color: '#fbbf24' },
    { name: 'Rejected', value: 1200, color: '#ef4444' },
  ];

  // Record summary data - ALL TIME - Records
  const recordSummaryRecordsAll = [
    { name: 'Approved', value: 6000, color: '#10b981' },
    { name: 'Pending', value: 3000, color: '#fbbf24' },
    { name: 'Rejected', value: 2200, color: '#ef4444' },
  ];

  // Recent records - Division
  const recentRecordsDivision = [
    { id: 1, name: 'Part Approval Form - Brake System.xlsx', size: '3.2 MB', date: 'Today' },
    { id: 2, name: 'Manufacturer Approval - Supplier A.xlsx', size: '1.1 MB', date: 'Today' },
    { id: 3, name: 'Alternative Part Request.pdf', size: '2.7 MB', date: 'Today' },
    { id: 4, name: 'Quality Assessment Report.docx', size: '2.7 MB', date: 'Yesterday' },
  ];

  // Recent records - Sections
  const recentRecordsSections = [
    { id: 1, name: 'Section A - Quality Standards.xlsx', size: '2.1 MB', date: 'Today' },
    { id: 2, name: 'Section B - Material Specs.pdf', size: '1.8 MB', date: 'Today' },
    { id: 3, name: 'Section C - Cost Analysis.xlsx', size: '2.3 MB', date: 'Yesterday' },
    { id: 4, name: 'Section D - Compliance Report.docx', size: '1.5 MB', date: 'Yesterday' },
  ];

  // Recent records - Group
  const recentRecordsGroup = [
    { id: 1, name: 'Group 1 - Automotive Review.xlsx', size: '4.2 MB', date: 'Today' },
    { id: 2, name: 'Group 2 - Supplier Assessment.pdf', size: '3.1 MB', date: 'Today' },
    { id: 3, name: 'Group 3 - Manufacturing Audit.xlsx', size: '3.8 MB', date: 'Yesterday' },
    { id: 4, name: 'Group 4 - Quality Review.docx', size: '2.9 MB', date: 'Yesterday' },
  ];

  // Recent records - Records
  const recentRecordsRecords = [
    { id: 1, name: 'Database Record - Parts Catalog.xlsx', size: '5.2 MB', date: 'Today' },
    { id: 2, name: 'Registry Record - Vendor List.pdf', size: '2.4 MB', date: 'Today' },
    { id: 3, name: 'Audit Record - Trail Log.xlsx', size: '3.5 MB', date: 'Yesterday' },
    { id: 4, name: 'Change Record - Modification Log.docx', size: '1.9 MB', date: 'Yesterday' },
  ];

  // Recent tasks - Division
  const recentTasksDivision = [
    { id: 1, name: 'Part Approval - Brake Assembly.xlsx', status: 'approved', assignee: 'Quality Team', statusDate: 'Approved today' },
    { id: 2, name: 'Manufacturer Change Request.xlsx', status: 'rejected', assignee: 'Engineering', statusDate: 'Rejected today' },
    { id: 3, name: 'New Supplier Evaluation.pdf', status: 'warning', assignee: 'Procurement', statusDate: '' },
    { id: 4, name: 'Part Specification Review.xlsx', status: 'approved', assignee: 'QA Manager', statusDate: 'Approved today' },
  ];

  // Recent tasks - Sections
  const recentTasksSections = [
    { id: 1, name: 'Section A Quality Check.xlsx', status: 'approved', assignee: 'QA Team', statusDate: 'Approved today' },
    { id: 2, name: 'Section B Material Review.pdf', status: 'warning', assignee: 'Engineering', statusDate: '' },
    { id: 3, name: 'Section C Cost Approval.xlsx', status: 'approved', assignee: 'Finance', statusDate: 'Approved today' },
    { id: 4, name: 'Section D Compliance.docx', status: 'rejected', assignee: 'Compliance', statusDate: 'Rejected today' },
  ];

  // Recent tasks - Group
  const recentTasksGroup = [
    { id: 1, name: 'Group 1 Review Process.xlsx', status: 'approved', assignee: 'Lead Engineer', statusDate: 'Approved today' },
    { id: 2, name: 'Group 2 Assessment.pdf', status: 'warning', assignee: 'Procurement Lead', statusDate: '' },
    { id: 3, name: 'Group 3 Manufacturing.xlsx', status: 'approved', assignee: 'Mfg Manager', statusDate: 'Approved today' },
    { id: 4, name: 'Group 4 Quality Audit.docx', status: 'rejected', assignee: 'QA Lead', statusDate: 'Rejected today' },
  ];

  // Recent tasks - Records
  const recentTasksRecords = [
    { id: 1, name: 'Database Update Task.xlsx', status: 'approved', assignee: 'Data Admin', statusDate: 'Approved today' },
    { id: 2, name: 'Registry Maintenance.pdf', status: 'approved', assignee: 'Vendor Mgmt', statusDate: 'Approved today' },
    { id: 3, name: 'Audit Trail Review.xlsx', status: 'warning', assignee: 'Compliance', statusDate: '' },
    { id: 4, name: 'Change Log Update.docx', status: 'rejected', assignee: 'Admin', statusDate: 'Rejected today' },
  ];

  // Analysis data - Division (department-wise)
  const analysisDivision = [
    { department: 'QA', approved: 180, pending: 90 },
    { department: 'Eng', approved: 160, pending: 120 },
    { department: 'Proc', approved: 200, pending: 100 },
    { department: 'Mfg', approved: 140, pending: 220 },
  ];

  // Analysis data - Sections
  const analysisSections = [
    { department: 'Sec A', approved: 120, pending: 60 },
    { department: 'Sec B', approved: 140, pending: 80 },
    { department: 'Sec C', approved: 160, pending: 70 },
    { department: 'Sec D', approved: 100, pending: 90 },
  ];

  // Analysis data - Group
  const analysisGroup = [
    { department: 'Grp 1', approved: 150, pending: 100 },
    { department: 'Grp 2', approved: 180, pending: 110 },
    { department: 'Grp 3', approved: 130, pending: 140 },
    { department: 'Grp 4', approved: 170, pending: 95 },
  ];

  // Analysis data - Records
  const analysisRecords = [
    { department: 'DB', approved: 220, pending: 80 },
    { department: 'Reg', approved: 190, pending: 100 },
    { department: 'Audit', approved: 210, pending: 90 },
    { department: 'Change', approved: 160, pending: 120 },
  ];

  // Analysis data - Division (department-wise) - MONTH VIEW
  const analysisDivisionMonth = [
    { department: 'QA', approved: 180, pending: 90 },
    { department: 'Eng', approved: 160, pending: 120 },
    { department: 'Proc', approved: 200, pending: 100 },
    { department: 'Mfg', approved: 140, pending: 220 },
  ];

  // Analysis data - Division - WEEK VIEW
  const analysisDivisionWeek = [
    { department: 'QA', approved: 45, pending: 22 },
    { department: 'Eng', approved: 40, pending: 30 },
    { department: 'Proc', approved: 50, pending: 25 },
    { department: 'Mfg', approved: 35, pending: 55 },
  ];

  // Analysis data - Division - YEAR VIEW
  const analysisDivisionYear = [
    { department: 'QA', approved: 2160, pending: 1080 },
    { department: 'Eng', approved: 1920, pending: 1440 },
    { department: 'Proc', approved: 2400, pending: 1200 },
    { department: 'Mfg', approved: 1680, pending: 2640 },
  ];

  // Analysis data - Division - CUSTOM VIEW (example data)
  const analysisDivisionCustom = [
    { department: 'QA', approved: 360, pending: 180 },
    { department: 'Eng', approved: 320, pending: 240 },
    { department: 'Proc', approved: 400, pending: 200 },
    { department: 'Mfg', approved: 280, pending: 440 },
  ];

  // Analysis data - Sections - MONTH VIEW
  const analysisSectionsMonth = [
    { department: 'Sec A', approved: 120, pending: 60 },
    { department: 'Sec B', approved: 140, pending: 80 },
    { department: 'Sec C', approved: 160, pending: 70 },
    { department: 'Sec D', approved: 100, pending: 90 },
  ];

  // Analysis data - Sections - WEEK VIEW
  const analysisSectionsWeek = [
    { department: 'Sec A', approved: 30, pending: 15 },
    { department: 'Sec B', approved: 35, pending: 20 },
    { department: 'Sec C', approved: 40, pending: 18 },
    { department: 'Sec D', approved: 25, pending: 23 },
  ];

  // Analysis data - Sections - YEAR VIEW
  const analysisSectionsYear = [
    { department: 'Sec A', approved: 1440, pending: 720 },
    { department: 'Sec B', approved: 1680, pending: 960 },
    { department: 'Sec C', approved: 1920, pending: 840 },
    { department: 'Sec D', approved: 1200, pending: 1080 },
  ];

  // Analysis data - Sections - CUSTOM VIEW
  const analysisSectionsCustom = [
    { department: 'Sec A', approved: 240, pending: 120 },
    { department: 'Sec B', approved: 280, pending: 160 },
    { department: 'Sec C', approved: 320, pending: 140 },
    { department: 'Sec D', approved: 200, pending: 180 },
  ];

  // Analysis data - Group - MONTH VIEW
  const analysisGroupMonth = [
    { department: 'Grp 1', approved: 150, pending: 100 },
    { department: 'Grp 2', approved: 180, pending: 110 },
    { department: 'Grp 3', approved: 130, pending: 140 },
    { department: 'Grp 4', approved: 170, pending: 95 },
  ];

  // Analysis data - Group - WEEK VIEW
  const analysisGroupWeek = [
    { department: 'Grp 1', approved: 38, pending: 25 },
    { department: 'Grp 2', approved: 45, pending: 28 },
    { department: 'Grp 3', approved: 33, pending: 35 },
    { department: 'Grp 4', approved: 43, pending: 24 },
  ];

  // Analysis data - Group - YEAR VIEW
  const analysisGroupYear = [
    { department: 'Grp 1', approved: 1800, pending: 1200 },
    { department: 'Grp 2', approved: 2160, pending: 1320 },
    { department: 'Grp 3', approved: 1560, pending: 1680 },
    { department: 'Grp 4', approved: 2040, pending: 1140 },
  ];

  // Analysis data - Group - CUSTOM VIEW
  const analysisGroupCustom = [
    { department: 'Grp 1', approved: 300, pending: 200 },
    { department: 'Grp 2', approved: 360, pending: 220 },
    { department: 'Grp 3', approved: 260, pending: 280 },
    { department: 'Grp 4', approved: 340, pending: 190 },
  ];

  // Analysis data - Records - MONTH VIEW
  const analysisRecordsMonth = [
    { department: 'DB', approved: 220, pending: 80 },
    { department: 'Reg', approved: 190, pending: 100 },
    { department: 'Audit', approved: 210, pending: 90 },
    { department: 'Change', approved: 160, pending: 120 },
  ];

  // Analysis data - Records - WEEK VIEW
  const analysisRecordsWeek = [
    { department: 'DB', approved: 55, pending: 20 },
    { department: 'Reg', approved: 48, pending: 25 },
    { department: 'Audit', approved: 53, pending: 23 },
    { department: 'Change', approved: 40, pending: 30 },
  ];

  // Analysis data - Records - YEAR VIEW
  const analysisRecordsYear = [
    { department: 'DB', approved: 2640, pending: 960 },
    { department: 'Reg', approved: 2280, pending: 1200 },
    { department: 'Audit', approved: 2520, pending: 1080 },
    { department: 'Change', approved: 1920, pending: 1440 },
  ];

  // Analysis data - Records - CUSTOM VIEW
  const analysisRecordsCustom = [
    { department: 'DB', approved: 440, pending: 160 },
    { department: 'Reg', approved: 380, pending: 200 },
    { department: 'Audit', approved: 420, pending: 180 },
    { department: 'Change', approved: 320, pending: 240 },
  ];

  // Get data based on active tab
  const pendingRecords = activeTab === 'division' ? pendingRecordsDivision :
                         activeTab === 'sections' ? pendingRecordsSections :
                         activeTab === 'group' ? pendingRecordsGroup :
                         pendingRecordsRecords;

  // Pagination calculations
  const totalPages = Math.ceil(pendingRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = pendingRecords.slice(indexOfFirstRecord, indexOfLastRecord);

  // Reset to page 1 when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const recordSummaryData = activeTab === 'division' ? (summaryFilter === 'week' ? recordSummaryDivisionWeek : summaryFilter === 'year' ? recordSummaryDivisionYear : summaryFilter === 'all' ? recordSummaryDivisionAll : recordSummaryDivision) :
                            activeTab === 'sections' ? (summaryFilter === 'week' ? recordSummarySectionsWeek : summaryFilter === 'year' ? recordSummarySectionsYear : summaryFilter === 'all' ? recordSummarySectionsAll : recordSummarySections) :
                            activeTab === 'group' ? (summaryFilter === 'week' ? recordSummaryGroupWeek : summaryFilter === 'year' ? recordSummaryGroupYear : summaryFilter === 'all' ? recordSummaryGroupAll : recordSummaryGroup) :
                            (summaryFilter === 'week' ? recordSummaryRecordsWeek : summaryFilter === 'year' ? recordSummaryRecordsYear : summaryFilter === 'all' ? recordSummaryRecordsAll : recordSummaryRecords);

  const recentRecords = activeTab === 'division' ? recentRecordsDivision :
                        activeTab === 'sections' ? recentRecordsSections :
                        activeTab === 'group' ? recentRecordsGroup :
                        recentRecordsRecords;

  const recentTasks = activeTab === 'division' ? recentTasksDivision :
                      activeTab === 'sections' ? recentTasksSections :
                      activeTab === 'group' ? recentTasksGroup :
                      recentTasksRecords;

  const analysisData = activeTab === 'division' ? (dateFilter === 'month' ? analysisDivisionMonth : dateFilter === 'week' ? analysisDivisionWeek : dateFilter === 'year' ? analysisDivisionYear : analysisDivisionCustom) :
                       activeTab === 'sections' ? (dateFilter === 'month' ? analysisSectionsMonth : dateFilter === 'week' ? analysisSectionsWeek : dateFilter === 'year' ? analysisSectionsYear : analysisSectionsCustom) :
                       activeTab === 'group' ? (dateFilter === 'month' ? analysisGroupMonth : dateFilter === 'week' ? analysisGroupWeek : dateFilter === 'year' ? analysisGroupYear : analysisGroupCustom) :
                       (dateFilter === 'month' ? analysisRecordsMonth : dateFilter === 'week' ? analysisRecordsWeek : dateFilter === 'year' ? analysisRecordsYear : analysisRecordsCustom);

  // KPI Calculations
  const safeReports = Array.isArray(reports) ? reports : [];
  const safeTemplates = Array.isArray(templates) ? templates : [];
  
  const totalRequestsRaised = safeReports.length;
  const totalDocumentsUploaded = safeTemplates.length;
  const totalApproved = safeReports.filter(report => report?.status === 'approved').length;
  const pendingApprovalCount = safeReports.filter(report => report?.status === 'pending' || report?.status === 'in-progress').length;
  const rejectedDocuments = safeReports.filter(report => report?.status === 'rejected').length;
  const overallApprovalRate = totalRequestsRaised > 0 
    ? Math.round((totalApproved / totalRequestsRaised) * 100) : 0;

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      {/* Beautiful KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Requests Card */}
        <div className="group relative">
          <div className="text-center">
            <div className="relative inline-block mb-3">
              {/* Large Circle Background */}
              <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                {/* Small Icon Circle - Top Right */}
                <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                {/* Main Number */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-700">{totalRequestsRaised}</div>
                  <div className="text-xs text-blue-600 mt-1">PRs</div>
                </div>
              </div>
            </div>
            <div className="text-slate-600 text-sm">Total</div>
          </div>
        </div>

        {/* Total Approved Card */}
        <div className="group relative">
          <div className="text-center">
            <div className="relative inline-block mb-3">
              {/* Large Circle Background */}
              <div className="w-36 h-36 rounded-full bg-purple-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                {/* Small Icon Circle - Top Right */}
                <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center shadow-md">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                {/* Main Number */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-700">{totalApproved}</div>
                  <div className="text-xs text-purple-600 mt-1">New PRs</div>
                </div>
              </div>
            </div>
            <div className="text-slate-600 text-sm">Budget</div>
          </div>
        </div>

        {/* Pending Approval Card */}
        <div className="group relative">
          <div className="text-center">
            <div className="relative inline-block mb-3">
              {/* Large Circle Background */}
              <div className="w-36 h-36 rounded-full bg-cyan-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                {/* Small Icon Circle - Top Right */}
                <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center shadow-md">
                  <FileClock className="h-4 w-4 text-white" />
                </div>
                {/* Main Number */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-cyan-700">{pendingApprovalCount}</div>
                  <div className="text-xs text-cyan-600 mt-1">Modification</div>
                </div>
              </div>
            </div>
            <div className="text-slate-600 text-sm">Budget</div>
          </div>
        </div>

        {/* Templates Available Card */}
        <div className="group relative">
          <div className="text-center">
            <div className="relative inline-block mb-3">
              {/* Large Circle Background */}
              <div className="w-36 h-36 rounded-full bg-green-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                {/* Small Icon Circle - Top Right */}
                <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-green-600 flex items-center justify-center shadow-md">
                  <FolderOpen className="h-4 w-4 text-white" />
                </div>
                {/* Main Number */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-700">{totalDocumentsUploaded}</div>
                  <div className="text-xs text-green-600 mt-1">Refurbished</div>
                </div>
              </div>
            </div>
            <div className="text-slate-600 text-sm">Budget</div>
          </div>
        </div>

        {/* Rejected Documents Card */}
        <div className="group relative">
          <div className="text-center">
            <div className="relative inline-block mb-3">
              {/* Large Circle Background */}
              <div className="w-36 h-36 rounded-full bg-yellow-100 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                {/* Small Icon Circle - Top Right */}
                <div className="absolute top-2 right-2 w-9 h-9 rounded-full bg-yellow-600 flex items-center justify-center shadow-md">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                {/* Main Number */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-700">{rejectedDocuments}</div>
                  <div className="text-xs text-yellow-600 mt-1">Pending</div>
                </div>
              </div>
            </div>
            <div className="text-slate-600 text-sm">For Approval</div>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex gap-3 mb-6">
        {/* Division Tab - Blue */}
        <button
          onClick={() => setActiveTab('division')}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-all duration-200 ${
            activeTab === 'division'
              ? 'bg-white border-blue-500 shadow-lg'
              : 'bg-slate-50/50 border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-md'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTab === 'division' ? 'bg-blue-500 shadow-md' : 'bg-blue-100/60'
          }`}>
            <Network className={`h-5 w-5 ${activeTab === 'division' ? 'text-white' : 'text-blue-600'}`} />
          </div>
          <span className={`font-medium ${activeTab === 'division' ? 'text-slate-800' : 'text-slate-600'}`}>Division</span>
        </button>

        {/* Sections Tab - Purple */}
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-all duration-200 ${
            activeTab === 'sections'
              ? 'bg-white border-purple-500 shadow-lg'
              : 'bg-slate-50/50 border-slate-200/80 hover:border-purple-300 hover:bg-white hover:shadow-md'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTab === 'sections' ? 'bg-purple-500 shadow-md' : 'bg-purple-100/60'
          }`}>
            <Layers className={`h-5 w-5 ${activeTab === 'sections' ? 'text-white' : 'text-purple-600'}`} />
          </div>
          <span className={`font-medium ${activeTab === 'sections' ? 'text-slate-800' : 'text-slate-600'}`}>Sections</span>
        </button>

        {/* Group Tab - Green */}
        <button
          onClick={() => setActiveTab('group')}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-all duration-200 ${
            activeTab === 'group'
              ? 'bg-white border-green-500 shadow-lg'
              : 'bg-slate-50/50 border-slate-200/80 hover:border-green-300 hover:bg-white hover:shadow-md'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTab === 'group' ? 'bg-green-500 shadow-md' : 'bg-green-100/60'
          }`}>
            <UsersIcon className={`h-5 w-5 ${activeTab === 'group' ? 'text-white' : 'text-green-600'}`} />
          </div>
          <span className={`font-medium ${activeTab === 'group' ? 'text-slate-800' : 'text-slate-600'}`}>Group</span>
        </button>

        {/* Records Tab - Orange */}
        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-all duration-200 ${
            activeTab === 'records'
              ? 'bg-white border-orange-500 shadow-lg'
              : 'bg-slate-50/50 border-slate-200/80 hover:border-orange-300 hover:bg-white hover:shadow-md'
          }`}
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
            activeTab === 'records' ? 'bg-orange-500 shadow-md' : 'bg-orange-100/60'
          }`}>
            <BarChart3 className={`h-5 w-5 ${activeTab === 'records' ? 'text-white' : 'text-orange-600'}`} />
          </div>
          <span className={`font-medium ${activeTab === 'records' ? 'text-slate-800' : 'text-slate-600'}`}>Records</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pending Record Table */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-800">
              Pending {activeTab === 'division' ? 'Division' : activeTab === 'sections' ? 'Sections' : activeTab === 'group' ? 'Group' : 'Records'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-600">
                    <th className="text-left py-3 px-4 text-white text-sm font-semibold">Name</th>
                    <th className="text-left py-3 px-4 bg-yellow-100 text-slate-800 text-sm font-semibold">Class</th>
                    <th className="text-left py-3 px-4 bg-yellow-100 text-slate-800 text-sm font-semibold">Due Date</th>
                    <th className="text-left py-3 px-4 bg-yellow-100 text-slate-800 text-sm font-semibold">OWNER</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-5 w-5 text-blue-600" />
                          <span className="text-slate-700">{record.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{record.class}</td>
                      <td className="py-3 px-4 text-slate-600">{record.dueDate}</td>
                      <td className="py-3 px-4 text-slate-600">{record.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="text-sm text-slate-600">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, pendingRecords.length)} of {pendingRecords.length} records
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                    currentPage === 1
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-400'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-400'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                    currentPage === totalPages
                      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-400'
                  }`}
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Record Summary Donut Chart */}
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-slate-800">Record Summary</CardTitle>
              
              {/* Filter Buttons */}
              <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200">
                <button
                  onClick={() => {
                    setSummaryFilter('week');
                    setShowMonthDropdown(false);
                    setShowYearDropdown(false);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    summaryFilter === 'week'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Week
                </button>
                
                {/* Month Button with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setSummaryFilter('month');
                      setShowMonthDropdown(!showMonthDropdown);
                      setShowYearDropdown(false);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      summaryFilter === 'month'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Month
                  </button>
                  
                  {/* Month Dropdown */}
                  {showMonthDropdown && summaryFilter === 'month' && (
                    <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-32 max-h-48 overflow-y-auto">
                      {months.map((month) => (
                        <button
                          key={month}
                          onClick={() => {
                            setSelectedMonth(month);
                            setShowMonthDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${
                            selectedMonth === month ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-700'
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Year Button with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setSummaryFilter('year');
                      setShowYearDropdown(!showYearDropdown);
                      setShowMonthDropdown(false);
                    }}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      summaryFilter === 'year'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Year
                  </button>
                  
                  {/* Year Dropdown */}
                  {showYearDropdown && summaryFilter === 'year' && (
                    <div className="absolute top-full mt-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-24 max-h-48 overflow-y-auto">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setShowYearDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${
                            selectedYear === year ? 'bg-blue-100 text-blue-700 font-medium' : 'text-slate-700'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setSummaryFilter('all');
                    setShowMonthDropdown(false);
                    setShowYearDropdown(false);
                  }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    summaryFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All
                </button>
              </div>
            </div>
            
            {/* Display Selected Month/Year */}
            {summaryFilter === 'month' && (
              <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Showing data for: <span className="font-medium text-blue-600">{selectedMonth}</span></span>
              </div>
            )}
            {summaryFilter === 'year' && (
              <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span>Showing data for: <span className="font-medium text-blue-600">{selectedYear}</span></span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center min-h-[220px]">
              <div className="w-full h-[220px]">
                <ResponsiveContainer width="100%" height={220} minHeight={220}>
                  <PieChart>
                    <Pie
                      data={recordSummaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {recordSummaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Legend */}
            <div className="flex justify-around mt-4">
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-slate-600">Pending</span>
                </div>
                <div className="text-slate-800 font-semibold">{recordSummaryData[1].value}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-600">Rejected</span>
                </div>
                <div className="text-slate-800 font-semibold">{recordSummaryData[2].value}</div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-600">Approved</span>
                </div>
                <div className="text-slate-800 font-semibold">{recordSummaryData[0].value}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Analysis Bar Chart - Full Width */}
      <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-lg mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-slate-800">Budget Analysis</CardTitle>
            
            {/* Date Range Filters - All in one row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Quick Filter Buttons */}
              <div className="flex items-center gap-2 p-1 bg-white rounded-lg border border-slate-200">
                <button
                  onClick={() => {
                    setDateFilter('week');
                    setShowCustomDatePicker(false);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    dateFilter === 'week'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => {
                    setDateFilter('month');
                    setShowCustomDatePicker(false);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    dateFilter === 'month'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => {
                    setDateFilter('year');
                    setShowCustomDatePicker(false);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    dateFilter === 'year'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Year
                </button>
                <button
                  onClick={() => {
                    setDateFilter('custom');
                    setShowCustomDatePicker(!showCustomDatePicker);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    dateFilter === 'custom'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Custom Date Inputs - Inline */}
              {showCustomDatePicker && dateFilter === 'custom' && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      placeholder="Start Date"
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      placeholder="End Date"
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md h-8 px-3 text-xs"
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          console.log('Apply custom date range:', customStartDate, 'to', customEndDate);
                          // Apply filter logic here
                        } else {
                          alert('Please select both start and end dates');
                        }
                      }}
                    >
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        setCustomStartDate('');
                        setCustomEndDate('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </>
              )}

              {/* Filter Icon Indicator - Only show when custom is not expanded */}
              {!(showCustomDatePicker && dateFilter === 'custom') && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                  <Filter className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium capitalize">{dateFilter}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-[350px]">
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height={350} minHeight={350}>
              <BarChart data={analysisData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="department" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Legend 
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />
              <Bar dataKey="approved" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Approved" />
              <Bar dataKey="pending" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section - Recent Records and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Records */}
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-800">Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRecords.map((record) => (
                <div 
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-slate-800 text-sm font-medium">{record.name}</div>
                      <div className="text-slate-500 text-xs">{record.size}</div>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      record.date === 'Today' 
                        ? 'border-green-300 text-green-700 bg-green-50' 
                        : 'border-slate-300 text-slate-600 bg-slate-50'
                    }`}
                  >
                    {record.date}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-800">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      task.status === 'approved' 
                        ? 'bg-green-100' 
                        : task.status === 'rejected' 
                        ? 'bg-red-100' 
                        : 'bg-yellow-100'
                    }`}>
                      {task.status === 'approved' && <CheckCircle className="h-6 w-6 text-green-600" />}
                      {task.status === 'rejected' && <XIcon className="h-6 w-6 text-red-600" />}
                      {task.status === 'warning' && <AlertTriangle className="h-6 w-6 text-yellow-600" />}
                    </div>
                    <div>
                      <div className="text-slate-800 text-sm font-medium">{task.name}</div>
                      {task.statusDate && (
                        <div className={`text-xs ${
                          task.status === 'approved' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {task.statusDate}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-slate-600 text-sm">{task.assignee}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});