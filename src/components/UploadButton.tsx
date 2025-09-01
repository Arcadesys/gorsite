"use client";

import { useRef, useState } from 'react';

type Props = {
  label?: string;
  accept?: string;
  onUploaded: (publicUrl: string, path: string) => void;
  className?: string;
  disabled?: boolean;
};

export default function UploadButton({ label = 'Upload', accept = 'image/*', onUploaded, className = '', disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file: File) => {
    setError(null);
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
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

