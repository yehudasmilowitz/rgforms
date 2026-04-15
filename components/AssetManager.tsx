'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AssetModuleSummary, AssetFile } from '@/types';
import { uploadAssetFile, deleteAssetFile, formatFileSize } from '@/lib/assetUpload';

// ─── Icons ────────────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M1.5 3.5h10M4 3.5V3a.5.5 0 01.5-.5h4A.5.5 0 019 3v.5M3 3.5l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 9V2M4 5l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 10v1.5A1.5 1.5 0 003.5 13h7a1.5 1.5 0 001.5-1.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 3a1 1 0 011-1h7l4 4v11a1 1 0 01-1 1H5a1 1 0 01-1-1V3z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OptimisticFile extends AssetFile {
  _uploading?: boolean;
  _uploadError?: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg z-[100]"
      style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    >
      {message}
    </motion.div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  file,
  folderUrl,
  onConfirm,
  onCancel,
  deleting,
  deleteError,
}: {
  file: AssetFile;
  folderUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
  deleteError: string | null;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <motion.div
        className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-4"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Delete &ldquo;{file.name}&rdquo;?
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This will permanently remove the file from your Drive folder. This cannot be undone.
          </p>
          {deleteError && (
            <div
              className="mt-1 rounded-lg px-3 py-2 text-xs leading-relaxed"
              style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)', color: 'oklch(0.72 0.16 25)', border: '1px solid' }}
            >
              {deleteError.includes('directly to Drive') ? (
                <>
                  This file was added directly to Drive. Delete it from{' '}
                  <a
                    href={folderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    the Drive folder
                  </a>{' '}
                  instead.
                </>
              ) : deleteError}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          {!deleteError && (
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-400"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            {deleteError ? 'Close' : 'Cancel'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── File card ────────────────────────────────────────────────────────────────

function FileCard({
  file,
  onDelete,
  onCopyUrl,
}: {
  file: OptimisticFile;
  onDelete: () => void;
  onCopyUrl: () => void;
}) {
  return (
    <div
      className="rounded-xl border flex flex-col overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: file._uploading ? 0.6 : 1,
      }}
    >
      {/* Preview area */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: '120px', background: 'var(--color-surface-2)' }}
      >
        {file.isImage ? (
          <button
            type="button"
            onClick={onCopyUrl}
            className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] group"
            title="Click to copy URL"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.url}
              alt={file.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <span className="text-xs font-medium text-white">Copy URL</span>
            </div>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1" style={{ color: 'var(--color-muted)' }}>
            <FileIcon />
            <span className="text-[10px] font-mono">{file.mimeType.split('/')[1] ?? file.mimeType}</span>
          </div>
        )}
        {file._uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#fff', borderTopColor: 'transparent' }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2.5 py-2 flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-[10px] font-medium truncate" style={{ color: 'var(--color-text)' }}>
            {file._uploading ? 'Uploading…' : file.name}
          </p>
          {!file._uploading && (
            <p className="text-[9px]" style={{ color: 'var(--color-muted)' }}>
              {formatFileSize(file.size)}
            </p>
          )}
        </div>
        {!file._uploading && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400 shrink-0"
            style={{ color: 'var(--color-muted)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
            aria-label={`Delete ${file.name}`}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main AssetManager ────────────────────────────────────────────────────────

interface AssetManagerProps {
  module: AssetModuleSummary;
  accessToken: string;
  onClose: () => void;
}

export default function AssetManager({ module, accessToken, onClose }: AssetManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<OptimisticFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);

  const [pendingDelete, setPendingDelete] = useState<OptimisticFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!module.deploymentUrl) {
      setLoadError('No deployment URL found for this module.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    setIsAuthError(false);

    try {
      const res = await fetch(module.deploymentUrl);
      const text = await res.text();
      let json: { data?: AssetFile[]; error?: string };
      try {
        json = JSON.parse(text) as { data?: AssetFile[]; error?: string };
      } catch {
        setIsAuthError(true);
        setLoadError('The endpoint returned an unexpected response. Authorization may be required.');
        setLoading(false);
        return;
      }
      if (json.error) throw new Error(json.error);
      setFiles(json.data ?? []);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [module.deploymentUrl]);

  useEffect(() => { load(); }, [load]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be re-selected
    e.target.value = '';

    setUploadError(null);

    // Optimistic entry
    const optimisticId = `opt-${Date.now()}`;
    const isImage = file.type.startsWith('image/');
    const optimistic: OptimisticFile = {
      id: optimisticId,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      isImage,
      size: file.size,
      url: isImage ? URL.createObjectURL(file) : '',
      driveUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _uploading: true,
    };
    setFiles((prev) => [optimistic, ...prev]);

    try {
      const uploaded = await uploadAssetFile(accessToken, module.folderId, file);
      setFiles((prev) => prev.map((f) => (f.id === optimisticId ? { ...uploaded } : f)));
    } catch (err) {
      setFiles((prev) => prev.filter((f) => f.id !== optimisticId));
      setUploadError((err as Error).message);
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const file = pendingDelete;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAssetFile(accessToken, file.id);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(url).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
    setToast('URL copied to clipboard!');
  }

  const recordCount = loading ? null : files.filter((f) => !f._uploading).length;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between gap-4 px-5 py-4 border-b shrink-0"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            aria-label="Close asset manager"
          >
            <XIcon />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {module.moduleName}
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
              {loading ? 'Loading…' : recordCount !== null ? `${recordCount} file${recordCount !== 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || isAuthError}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'var(--color-accent)', color: '#fff' }}
          onMouseEnter={(e) => { if (!loading && !isAuthError) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
        >
          <UploadIcon />
          Upload file
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">

          {/* Upload error */}
          {uploadError && (
            <div
              className="rounded-xl border px-4 py-3 text-sm flex items-center justify-between gap-3"
              style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)', color: 'oklch(0.72 0.16 25)' }}
            >
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError(null)} className="text-xs underline hover:no-underline shrink-0">Dismiss</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }}
              />
            </div>
          )}

          {/* Load error */}
          {!loading && loadError && (
            <div
              className="rounded-xl border px-4 py-5 flex flex-col items-center gap-3 text-center"
              style={{ background: 'oklch(0.62 0.22 25 / 0.08)', borderColor: 'oklch(0.62 0.22 25 / 0.30)' }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.72 0.16 25)' }}>
                {loadError}
              </p>
              {isAuthError && module.deploymentUrl && (
                <>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
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
                </>
              )}
              <button
                type="button"
                onClick={load}
                className="text-xs underline hover:no-underline"
                style={{ color: 'var(--color-muted)' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !loadError && files.length === 0 && (
            <div
              className="rounded-xl border px-6 py-12 flex flex-col items-center gap-3 text-center"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>No files yet</p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Upload files using the button above, or drop them directly into the Drive folder.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <UploadIcon />
                Upload file
              </button>
            </div>
          )}

          {/* File grid */}
          {!loading && files.length > 0 && (
            <AnimatePresence initial={false}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {files.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FileCard
                      file={file}
                      onDelete={() => { setPendingDelete(file); setDeleteError(null); }}
                      onCopyUrl={() => handleCopyUrl(file.url)}
                    />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      {pendingDelete && (
        <DeleteConfirmDialog
          file={pendingDelete}
          folderUrl={module.folderUrl}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setPendingDelete(null); setDeleteError(null); }}
          deleting={deleting}
          deleteError={deleteError}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
