"use client";

import { useRef, useState } from 'react';

type Props = {
  label?: string;
  accept?: string;
  onUploaded: (publicUrl: string, path: string) => void;
  className?: string;
  disabled?: boolean;
  maxSizeMB?: number;
};

export default function UploadButton({ label = 'Upload', accept = 'image/*', onUploaded, className = '', disabled, maxSizeMB = 20 }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setError(null);
    if (!file) return;
    // Client-side checks for faster feedback
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      let data: any = {};
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        let msg = data?.error || (res.status === 413 ? `File too large. Max ${maxSizeMB}MB.` : 'Upload failed');
        if (data?.requestId) msg += ` (Ref: ${data.requestId})`;
        throw new Error(msg);
      }
      onUploaded(String(data.publicUrl), String(data.path));
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        onClick={pick}
        disabled={disabled || loading}
        className={`px-3 py-2 rounded border text-xs ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Uploading…' : label}
      </button>
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </div>
  );
}
