import React, { useEffect, useRef, useState } from 'react';
import { FileText, FileSpreadsheet, FileType } from 'lucide-react';

interface TemplateFilePreviewProps {
  file: File;
  className?: string;
}

export const TemplateFilePreview: React.FC<TemplateFilePreviewProps> = ({ file, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isPdf = ext === 'pdf';
  const isWord = ['doc', 'docx'].includes(ext);
  const isExcel = ['xlsx', 'xls'].includes(ext);

  useEffect(() => {
    if (!isPdf || !canvasRef.current) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer || cancelled) return;
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
        }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (err) {
        if (!cancelled) setPdfError('Could not load PDF preview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
    return () => {
      cancelled = true;
    };
  }, [file, isPdf]);

  const sizeStr = file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(2)} KB`;

  if (isPdf) {
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 overflow-hidden ${className}`}>
        <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-slate-800">{file.name}</span>
          <span className="text-xs text-slate-500">{sizeStr}</span>
        </div>
        <div className="p-2 flex justify-center bg-slate-100 min-h-[280px] max-h-[400px] overflow-auto">
          {loading && <div className="flex items-center text-slate-500 text-sm">Loading preview...</div>}
          {pdfError && <div className="flex items-center text-amber-600 text-sm">{pdfError}</div>}
          {!loading && !pdfError && <canvas ref={canvasRef} className="max-w-full shadow-sm" />}
        </div>
        <p className="px-3 py-1.5 text-xs text-slate-500 bg-white border-t border-slate-100">Page 1 preview</p>
      </div>
    );
  }

  if (isWord || isExcel) {
    const Icon = isWord ? FileType : FileSpreadsheet;
    const typeLabel = isWord ? 'Word document' : 'Excel spreadsheet';
    return (
      <div className={`rounded-xl border border-slate-200 bg-slate-50 overflow-hidden ${className}`}>
        <div className="px-4 py-6 flex flex-col items-center justify-center min-h-[200px] bg-white border-b border-slate-100">
          <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Icon className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-800 truncate max-w-full px-2">{file.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sizeStr} · {typeLabel}</p>
          <p className="text-xs text-slate-400 mt-2">Content preview after upload & conversion</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${className}`}>
      <div className="flex items-center gap-3">
        <FileText className="h-10 w-10 text-slate-400" />
        <div>
          <p className="text-sm font-medium text-slate-800">{file.name}</p>
          <p className="text-xs text-slate-500">{sizeStr}</p>
        </div>
      </div>
    </div>
  );
};
