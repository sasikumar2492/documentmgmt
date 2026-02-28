import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Building2, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users,
  FileText,
  Search,
  CheckCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";

interface Department {
  id: number;
  name: string;
  code: string;
  manager: string;
  users: number;
  activeRequests: number;
  gradient: string;
}

const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, name: 'Quality Assurance', code: 'QA', manager: 'Sarah Johnson', users: 24, activeRequests: 12, gradient: 'from-purple-500 to-indigo-600' },
  { id: 2, name: 'Production Engineering', code: 'PE', manager: 'Michael Chen', users: 18, activeRequests: 8, gradient: 'from-blue-500 to-cyan-600' },
  { id: 3, name: 'Supply Chain', code: 'SC', manager: 'Emily Rodriguez', users: 32, activeRequests: 15, gradient: 'from-green-500 to-emerald-600' },
  { id: 4, name: 'Research & Development', code: 'RD', manager: 'David Kim', users: 28, activeRequests: 22, gradient: 'from-orange-500 to-amber-600' },
  { id: 5, name: 'Manufacturing', code: 'MFG', manager: 'Lisa Anderson', users: 45, activeRequests: 18, gradient: 'from-pink-500 to-rose-600' },
  { id: 6, name: 'Materials Testing', code: 'MT', manager: 'Robert Taylor', users: 15, activeRequests: 9, gradient: 'from-teal-500 to-cyan-600' }
];

export const DepartmentSetupManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [form, setForm] = useState({ name: '', code: '', manager: '' });

  const handleSave = () => {
    if (editingId !== null) {
      setDepartments(prev => prev.map(d => d.id === editingId ? { ...d, ...form } : d));
      setEditingId(null);
    } else {
      const newDept = {
        id: Date.now(),
        ...form,
        users: 0,
        activeRequests: 0,
        gradient: 'from-blue-500 to-cyan-600'
      };
      setDepartments(prev => [...prev, newDept]);
      setIsAdding(false);
    }
    setForm({ name: '', code: '', manager: '' });
  };

  const filtered = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Department Setup</h1>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search departments..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="pl-10"
        />
      </div>

      {(isAdding || editingId !== null) && (
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Code</Label>
                <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Manager</Label>
                <Input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
              <Button onClick={handleSave} className="bg-blue-600"><Save className="mr-2 h-4 w-4" /> Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden border-0 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Code</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-center">Stats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(dept => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${dept.gradient}`} />
                    {dept.name}
                  </div>
                </TableCell>
                <TableCell className="text-center"><Badge variant="outline">{dept.code}</Badge></TableCell>
                <TableCell>{dept.manager}</TableCell>
                <TableCell className="text-center text-xs text-slate-500">
                  {dept.users} Users | {dept.activeRequests} Reqs
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(dept.id); setForm(dept); }} className="h-8 w-8 p-0 text-blue-600"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDepartments(d => d.filter(x => x.id !== dept.id))} className="h-8 w-8 p-0 text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {totalPages > 1 && (
          <div className="p-3 border-t bg-slate-50/50">
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} /></PaginationItem>
                <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
};
