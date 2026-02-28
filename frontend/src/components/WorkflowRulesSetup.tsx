import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  GitBranch, Plus, Edit, Trash2, Play, Pause, Search, Settings, 
  Save, X, ChevronDown, ArrowLeft, Layout, ShieldCheck, 
  UserCheck, UserCog, FileSearch, CheckCircle2, ArrowDown
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface WorkflowStep { id: string; name: string; role: string; action: string; }
interface Workflow { id: number; name: string; description: string; steps: number; status: 'active' | 'paused'; requests: number; gradient: string; stepDetails?: WorkflowStep[]; }

const INITIAL_WORKFLOWS: Workflow[] = [
  { id: 1, name: 'Standard Approval Workflow', description: 'Default approval process for all standard part requests.', steps: 4, status: 'active', requests: 156, gradient: 'from-purple-500 to-indigo-600', stepDetails: [
    { id: '1', name: 'Initial Review', role: 'Reviewer', action: 'Verify documentation completeness.' },
    { id: '2', name: 'Technical Assessment', role: 'Approver', action: 'Evaluate technical specifications.' },
    { id: '3', name: 'Management Review', role: 'Manager', action: 'Final budget check.' },
    { id: '4', name: 'Quality Verification', role: 'Admin', action: 'Final system update.' }
  ]},
  { id: 2, name: 'Fast Track Approval', description: 'Expedited approval for urgent emergency parts.', steps: 2, status: 'active', requests: 42, gradient: 'from-green-500 to-emerald-600' },
  { id: 3, name: 'New Supplier Onboarding', description: 'Complete vetting process for new manufacturers.', steps: 6, status: 'active', requests: 23, gradient: 'from-blue-500 to-cyan-600' }
];

const RoleIcon = ({ role }: { role: string }) => {
  const props = { className: "h-4 w-4" };
  switch(role.toLowerCase()) {
    case 'preparator': return <Edit {...props} />;
    case 'reviewer': return <FileSearch {...props} />;
    case 'approver': return <UserCheck {...props} />;
    case 'manager': return <UserCog {...props} />;
    case 'admin': return <ShieldCheck {...props} />;
    default: return <CheckCircle2 {...props} />;
  }
};

export const WorkflowRulesSetup: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'form' | 'configure'>('list');
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' as const });
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const filtered = workflows.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = () => {
    if (view === 'form') {
      if (activeWorkflow) setWorkflows(prev => prev.map(w => w.id === activeWorkflow.id ? { ...w, ...form } : w));
      else setWorkflows(prev => [...prev, { id: Date.now(), ...form, steps: 0, requests: 0, gradient: 'from-blue-500 to-cyan-600' }]);
    } else if (view === 'configure' && activeWorkflow) {
      setWorkflows(prev => prev.map(w => w.id === activeWorkflow.id ? { ...w, stepDetails: steps, steps: steps.length } : w));
    }
    setView('list');
  };

  const addStep = () => setSteps(prev => [...prev, { id: Date.now().toString(), name: 'New Stage', role: 'Reviewer', action: '' }]);

  if (view === 'form') return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setView('list')} className="hover:bg-slate-100 rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">{activeWorkflow ? 'Edit' : 'Create'} Workflow</h2>
      </div>
      <Card className="shadow-lg border-0">
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-500">WORKFLOW NAME</Label>
            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-11 border-slate-200" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-500">DESCRIPTION</Label>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="min-h-[100px] border-slate-200" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => setView('list')} className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-500">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 bg-blue-600 text-white shadow-lg hover:bg-blue-700">Save Workflow</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (view === 'configure') return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-4 px-2 border-b border-slate-100 -mx-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setView('list')} className="hover:bg-slate-100 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-bold leading-none">Configure Steps</h2>
            <p className="text-xs text-slate-500 mt-1">{activeWorkflow?.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setView('list')} className="text-slate-500 hover:text-slate-800 hover:bg-slate-50">Cancel</Button>
          <Button size="sm" onClick={handleSave} className="bg-emerald-600 text-white shadow-md hover:bg-emerald-700">Save Configuration</Button>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-0 pb-20">
        {steps.map((step, idx) => (
          <div key={step.id} className="w-full flex flex-col items-center">
            <Card className="w-full border-slate-200 shadow-sm overflow-hidden group hover:border-blue-400 transition-colors">
              <CardHeader className="p-3 bg-slate-50/80 border-b flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                  <Input 
                    value={step.name} 
                    onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? {...s, name: e.target.value} : s))} 
                    className="font-bold border-none p-0 h-auto focus-visible:ring-0 bg-transparent text-sm w-full" 
                    placeholder="Step Title"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSteps(prev => prev.filter(s => s.id !== step.id))} className="h-7 w-7 text-slate-300 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400">ROLE</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><RoleIcon role={step.role} /></span>
                      <select 
                        value={step.role} 
                        onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? {...s, role: e.target.value} : s))} 
                        className="w-full h-8 pl-8 pr-2 rounded border border-slate-200 text-xs appearance-none bg-white font-medium"
                      >
                        {['Preparator', 'Reviewer', 'Approver', 'Manager', 'Admin'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-400">ACTION</Label>
                    <Input 
                      value={step.action} 
                      onChange={e => setSteps(prev => prev.map(s => s.id === step.id ? {...s, action: e.target.value} : s))} 
                      className="h-8 text-xs border-slate-200" 
                      placeholder="Required task..." 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            {idx < steps.length - 1 && (
              <div className="py-2 flex flex-col items-center">
                <div className="w-0.5 h-3 bg-blue-100" />
                <ArrowDown className="h-4 w-4 text-blue-400 -my-0.5" />
                <div className="w-0.5 h-3 bg-blue-100" />
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-6">
          <Button onClick={addStep} variant="ghost" className="h-10 px-6 border-dashed border-2 border-slate-200 rounded-full text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all font-semibold bg-white">
            <Plus className="mr-2 h-4 w-4" /> Add Next Approval Step
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Workflow Rules</h1>
          <p className="text-sm text-slate-500">Configure and manage approval hierarchies</p>
        </div>
        <Button onClick={() => { setActiveWorkflow(null); setForm({name:'', description:'', status:'active'}); setView('form'); }} className="bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> New Workflow
        </Button>
      </div>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input placeholder="Search workflows..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-11 border-slate-200 focus:ring-blue-500/20" />
      </div>
      <Card className="overflow-hidden border-0 shadow-xl bg-white rounded-xl">
        <Table>
          <TableHeader className="bg-slate-50/50 border-b border-slate-100">
            <TableRow>
              <TableHead className="px-6 font-bold text-slate-600">Workflow</TableHead>
              <TableHead className="text-center font-bold text-slate-600">Stages</TableHead>
              <TableHead className="text-center font-bold text-slate-600">Status</TableHead>
              <TableHead className="text-right pr-6 font-bold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(w => (
              <TableRow key={w.id} className="hover:bg-slate-50/50 group transition-colors">
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${w.gradient} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <GitBranch className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{w.name}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{w.description}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0">{w.steps} Steps</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={w.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}>
                    {w.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setActiveWorkflow(w); setSteps(w.stepDetails || []); setView('configure'); }} className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setActiveWorkflow(w); setForm({ name: w.name, description: w.description, status: w.status }); setView('form'); }} className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setWorkflows(prev => prev.filter(x => x.id !== w.id))} className="h-8 w-8 p-0 text-red-400 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
