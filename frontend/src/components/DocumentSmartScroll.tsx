import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Search, 
  FileText, 
  Layers,
  Sparkles,
  Target,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { FormSection } from '../types';

interface DocumentSmartScrollProps {
  sections: FormSection[];
  activeSectionIndex: number;
  onSectionSelect: (index: number) => void;
  formValues: Record<string, any>;
  isCollapsed?: boolean;
  onOpenRemarks?: (e: React.MouseEvent, pageIdx: number) => void;
  pageRemarks?: Record<number, string>;
}

// Visual Miniature Preview of the actual page structure
const PageThumbnailPreview: React.FC<{ section: FormSection; isActive: boolean }> = ({ section, isActive }) => {
  return (
    <div className={`w-full h-full p-4 flex flex-col gap-2 transition-all duration-500 ${isActive ? 'bg-white' : 'bg-slate-50'}`}>
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-2">
        <div className="h-1.5 w-1/3 bg-slate-200 rounded-full" />
        <div className="h-1.5 w-4 bg-slate-200 rounded-full" />
      </div>
      
      {/* Content Skeleton - Represents the actual form fields */}
      <div className="flex-1 space-y-2">
        {section.fields.slice(0, 6).map((field, i) => (
          <div key={i} className="space-y-1">
            <div className="h-1 w-1/4 bg-slate-100 rounded-full" />
            <div className={`h-3 w-full rounded-sm border ${isActive ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200 bg-white'}`} />
          </div>
        ))}
        {section.fields.length > 6 && (
          <div className="flex justify-center pt-1">
            <div className="h-1 w-8 bg-slate-100 rounded-full" />
          </div>
        )}
      </div>

      {/* Footer Skeleton */}
      <div className="mt-auto pt-2 border-t border-slate-100 flex justify-between">
        <div className="h-1 w-8 bg-slate-100 rounded-full" />
        <div className="h-1 w-4 bg-slate-100 rounded-full" />
      </div>
    </div>
  );
};

export const DocumentSmartScroll: React.FC<DocumentSmartScrollProps> = ({
  sections,
  activeSectionIndex,
  onSectionSelect,
  formValues,
  isCollapsed = false,
  onOpenRemarks,
  pageRemarks = {}
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const calculateProgress = (section: FormSection) => {
    const totalFields = section.fields.length;
    if (totalFields === 0) return 0;
    
    const filledFields = section.fields.filter(field => {
      const val = formValues[field.id];
      return val !== undefined && val !== null && val !== '' && val !== false;
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const filteredSections = sections.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`h-full w-full transition-all duration-500 bg-white shadow-xl ${isCollapsed ? '' : ''}`}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        {!isCollapsed && (
          <div className="p-6 border-b border-slate-800 bg-slate-900 text-white">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Smart Navigator</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">Document View</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Find section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-[11px] text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        )}

        {/* Scrollable Thumbnails List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 smart-nav-scrollbar bg-slate-50/50">
          {filteredSections.map((section, idx) => {
            const actualIndex = sections.indexOf(section);
            const isActive = activeSectionIndex === actualIndex;
            const progress = calculateProgress(section);
            const isCompleted = progress === 100 && section.fields.length > 0;

            return (
              <div
                key={section.id}
                onClick={() => onSectionSelect(actualIndex)}
                className={`w-full group relative flex flex-col rounded-xl transition-all duration-500 border-2 overflow-hidden cursor-pointer ${
                  isActive 
                    ? 'border-blue-600 bg-white shadow-[0_20px_40px_-15px_rgba(59,130,246,0.25)] scale-[1.03] z-10' 
                    : 'border-slate-200 bg-white hover:border-blue-300 text-slate-600 grayscale-[0.5] hover:grayscale-0'
                }`}
              >
                {/* Visual Page Thumbnail */}
                <div className="h-44 w-full relative overflow-hidden bg-white border-b border-slate-100">
                  <PageThumbnailPreview section={section} isActive={isActive} />
                  
                  {/* Status Overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isActive ? 'bg-blue-600/5' : 'bg-transparent group-hover:bg-blue-600/5'}`}>
                    {isCompleted && (
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl border-4 border-white transform scale-110">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Page Number Badge */}
                  <div className={`absolute top-4 left-4 w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-black shadow-lg transition-colors duration-500 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                    {actualIndex + 1}
                  </div>

                  {/* Page Remarks Icon - NEW */}
                  <button
                    onClick={(e) => onOpenRemarks?.(e, actualIndex)}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 active:scale-95 z-20 ${
                      pageRemarks[actualIndex + 1] 
                        ? 'bg-amber-500 text-white ring-2 ring-amber-200' 
                        : 'bg-white text-slate-400 border border-slate-100'
                    }`}
                  >
                    <MessageSquare className={`h-4 w-4 ${pageRemarks[actualIndex + 1] ? 'animate-pulse' : ''}`} />
                    {pageRemarks[actualIndex + 1] && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </button>

                  {/* Visual "Interactive" Indicator */}
                  <div className={`absolute bottom-4 right-4 p-2 rounded-lg backdrop-blur-md transition-all duration-500 ${isActive ? 'bg-blue-600 text-white scale-100 opacity-0' : 'bg-white/80 text-slate-400 scale-90 opacity-0 group-hover:opacity-100'}`}>
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>

                {/* Info Area */}
                {!isCollapsed && (
                  <div className={`p-4 text-left w-full transition-colors duration-500 ${isActive ? 'bg-white' : 'bg-white'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-[12px] font-bold truncate flex-1 ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>
                        {section.title}
                      </p>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={`h-full transition-colors duration-500 ${isActive ? 'bg-blue-600' : 'bg-slate-400'}`}
                        />
                      </div>
                      <span className={`text-[10px] font-black min-w-[30px] text-right ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                        {progress}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall Progress Footer */}
        {!isCollapsed && (
          <div className="p-6 border-t border-slate-200 bg-white">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] mb-4">
              <span>Document Progress</span>
              <span className="text-blue-600 font-black">
                {Math.round(sections.reduce((acc, s) => acc + calculateProgress(s), 0) / (sections.length || 1))}%
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${sections.reduce((acc, s) => acc + calculateProgress(s), 0) / (sections.length || 1)}%` }}
                className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              />
            </div>
          </div>
        )}
      </div>
      <style>{`
        .smart-nav-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .smart-nav-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-left: 1px solid #e2e8f0;
        }
        .smart-nav-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        .smart-nav-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
        .smart-nav-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #3b82f6 #f1f5f9;
        }
      `}</style>
    </motion.div>
  );
};
