import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { MessageSquare, Send, User, Calendar } from 'lucide-react';

interface PageRemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (remark: string) => void;
  pageNumber: number;
  existingRemark?: string;
}

export const PageRemarksModal: React.FC<PageRemarksModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pageNumber,
  existingRemark = ""
}) => {
  const [remark, setRemark] = useState(existingRemark);

  const handleSave = () => {
    onSave(remark);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              Page {pageNumber} Remarks
            </DialogTitle>
            <DialogDescription className="text-blue-100/70 text-xs mt-1">
              Add specific feedback or requested changes for this section of the document.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <User className="h-3 w-3" />
            <span>Adding feedback for this section</span>
          </div>
          
          <Textarea 
            placeholder="Enter your observations, requested changes, or notes for this page..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="min-h-[150px] border-slate-200 focus:ring-blue-500 text-slate-900 resize-none"
            autoFocus
          />

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-[10px] text-blue-700 font-medium">
              Remarks are saved locally until the document is submitted.
            </span>
          </div>
        </div>

        <DialogFooter className="p-4 bg-slate-50 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} className="text-slate-600 border-slate-200">
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Save Remark
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};