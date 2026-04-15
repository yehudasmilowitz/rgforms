'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import type { AssetModuleSummary, AssetFile } from '@/types';

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AssetPickerProps {
  modules: AssetModuleSummary[];
  onSelect: (url: string) => void;
  onClose: () => void;
}

// ─── Module images fetcher ────────────────────────────────────────────────────

function useModuleImages(deploymentUrl: string) {
  const [images, setImages] = useState<AssetFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(deploymentUrl)
      .then(async (res) => {
        const text = await res.text();
        let json: { data?: AssetFile[]; error?: string };
        try {
          json = JSON.parse(text) as { data?: AssetFile[]; error?: string };
        } catch {
          throw new Error('auth_required');
        }
        if (json.error) throw new Error(json.error);
        return (json.data ?? []).filter((f) => f.isImage);
      })
      .then((imgs) => {
        if (!cancelled) { setImages(imgs); setLoading(false); }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message === 'auth_required' ? 'auth_required' : err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [deploymentUrl]);

  return { images, loading, error };
}

// ─── Module panel ─────────────────────────────────────────────────────────────

function ModuleImages({
  module,
  onSelect,
}: {
  module: AssetModuleSummary;
  onSelect: (url: string) => void;
}) {
  const { images, loading, error } = useModuleImages(module.deploymentUrl!);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (error === 'auth_required') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center px-4">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Authorization required</p>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--color-muted)' }}>
          Visit the endpoint URL to complete one-time authorization, then reload.
        </p>
        <a
          href={module.deploymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs underline hover:no-underline"
          style={{ color: 'var(--color-accent)' }}
        >
          Open endpoint to authorize →
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm" style={{ color: 'var(--color-error, #ef4444)' }}>{error}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>No images yet</p>
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Upload images to this asset module from the Assets tab.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 p-4">
      {images.map((file) => (
        <button
          key={file.id}
          type="button"
          onClick={() => onSelect(file.url)}
          className="flex flex-col gap-1 rounded-lg overflow-hidden border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] group"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
          title={file.name}
        >
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.url}
              alt={file.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <p
            className="px-1.5 pb-1.5 text-[10px] truncate w-full text-left"
            style={{ color: 'var(--color-muted)' }}
          >
            {file.name}
          </p>
        </button>
      ))}
    </div>
  );
}

// ─── Main AssetPicker ─────────────────────────────────────────────────────────

export default function AssetPicker({ modules, onSelect, onClose }: AssetPickerProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (modules.length === 0) {
    return (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl border p-6 flex flex-col gap-4"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Pick an image</h2>
            <button type="button" onClick={onClose} className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ color: 'var(--color-muted)' }}>
              <XIcon />
            </button>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            No asset modules found. Create one from the Assets tab in your dashboard.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  const activeModule = modules[activeIdx];

  function handleSelect(url: string) {
    onSelect(url);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl border flex flex-col overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          maxHeight: 'min(85vh, 600px)',
        }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Pick an image</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ color: 'var(--color-muted)' }}
          >
            <XIcon />
          </button>
        </div>

        {/* Module tabs (only if multiple) */}
        {modules.length > 1 && (
          <div
            className="flex gap-1 px-4 pt-3 pb-0 shrink-0 border-b overflow-x-auto"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {modules.map((mod, i) => (
              <button
                key={mod.sheetId}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{
                  background: i === activeIdx ? 'var(--color-bg)' : 'transparent',
                  color: i === activeIdx ? 'var(--color-accent)' : 'var(--color-muted)',
                  borderBottom: i === activeIdx ? `2px solid var(--color-accent)` : '2px solid transparent',
                }}
              >
                {mod.moduleName}
              </button>
            ))}
          </div>
        )}

        {/* Image grid */}
        <div className="overflow-y-auto flex-1">
          <ModuleImages
            key={activeModule.sheetId}
            module={activeModule}
            onSelect={handleSelect}
          />
        </div>
      </motion.div>
    </div>
  );
}
