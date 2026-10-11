import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Trash2, Paperclip, AlertCircle, FileCheck } from 'lucide-react';

export default function ResumeUploader({
  resumeFile,
  onResumeChange,
  label = 'Resume / CV',
  required = true,
  helperText = 'Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)'
}) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const processFile = (file) => {
    setError('');
    if (!file) return;

    // Check size limit: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 10MB. Please upload a smaller file.');
      return;
    }

    // Check file extensions
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setError('Invalid file format. Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }

    // Read as Base64 Data URL so it can be transmitted or previewed
    const reader = new FileReader();
    reader.onload = () => {
      const resumeData = {
        name: file.name,
        size: formatBytes(file.size),
        rawSize: file.size,
        type: file.type || 'application/pdf',
        dataUrl: reader.result,
        lastModified: file.lastModified
      };
      onResumeChange(resumeData);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try selecting the file again.');
    };
    reader.readAsDataURL(file);
  };

  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onResumeChange(null);
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-emerald-700">*</span>}
        </label>
        {resumeFile && (
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Ready to attach
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {resumeFile ? (
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 transition-all flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate" title={resumeFile.name}>
                {resumeFile.name}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                <span>{resumeFile.size || 'Verified format'}</span>
                <span>&bull;</span>
                <span className="text-emerald-700 font-semibold uppercase">
                  {resumeFile.name.split('.').pop() || 'PDF'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100/60 rounded-lg border border-emerald-200 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Remove resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className={`cursor-pointer p-5 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/30 bg-slate-50/50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-emerald-700">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              <span className="text-emerald-700 hover:underline">Click to upload resume</span> or drag and drop
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-rose-600 text-xs font-medium pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
