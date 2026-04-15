'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { GalleryModuleSummary } from '@/types';
import {
  listGalleryImages,
  appendGalleryImages,
  deleteGalleryImage,
  uploadAndPublishImage,
  type GalleryImage,
} from '@/lib/galleryManager';

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
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 12V4M7 7l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 13v2.5A1.5 1.5 0 004.5 17h11a1.5 1.5 0 001.5-1.5V13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 15l5-5 4 4 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
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

// ─── Image card ───────────────────────────────────────────────────────────────

interface OptimisticImage extends GalleryImage {
  _uploading?: boolean;
  _error?: string;
  _tempId?: string;
}

function ImageCard({
  image,
  onDelete,
  deleting,
}: {
  image: OptimisticImage;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden border group"
      style={{
        borderColor: image._error ? 'rgba(239,68,68,0.4)' : 'var(--color-border)',
        background: 'var(--color-surface)',
        opacity: deleting ? 0.4 : 1,
        transition: 'opacity 0.2s',
        aspectRatio: '1',
      }}
    >
      {/* Image preview */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--color-surface-2)' }}>
        {image._uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="2.5"/>
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>Uploading…</span>
          </div>
        ) : image.imageUrl && !imgError ? (
          <img
            src={image.imageUrl}
            alt={image.alt || image.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ color: 'var(--color-border)' }}>
            <ImagePlaceholderIcon />
          </div>
        )}
      </div>

      {/* Error overlay */}
      {image._error && (
        <div className="absolute inset-x-0 bottom-0 p-2 text-[10px] text-center" style={{ background: 'rgba(239,68,68,0.85)', color: '#fff' }}>
          {image._error}
        </div>
      )}

      {/* Title overlay at bottom */}
      {!image._uploading && !image._error && (
        <div
          className="absolute inset-x-0 bottom-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <p className="text-[10px] font-medium text-white truncate">{image.title || 'Untitled'}</p>
        </div>
      )}

      {/* Delete button */}
      {!image._uploading && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="absolute top-1.5 right-1.5 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
          aria-label={`Delete ${image.title || 'image'}`}
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

// ─── GalleryManager ───────────────────────────────────────────────────────────

interface GalleryManagerProps {
  module: GalleryModuleSummary;
  accessToken: string;
  onClose: () => void;
}

export default function GalleryManager({ module, accessToken, onClose }: GalleryManagerProps) {
  const [images, setImages] = useState<OptimisticImage[]>([]);
  const [numericSheetId, setNumericSheetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tempIdCounter = useRef(0);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    listGalleryImages(accessToken, module.sheetId)
      .then(({ images: imgs, numericSheetId: nsid }) => {
        setImages(imgs);
        setNumericSheetId(nsid);
        setLoading(false);
      })
      .catch((e: Error) => {
        setLoadError(e.message);
        setLoading(false);
      });
  }, [accessToken, module.sheetId]);

  // ── Upload files ────────────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    // Add optimistic placeholders
    const placeholders: OptimisticImage[] = imageFiles.map((f) => {
      const tempId = String(++tempIdCounter.current);
      return {
        rowIndex: -1,
        tempId: '_' + tempId,
        _tempId: '_' + tempId,
        _uploading: true,
        title: f.name.replace(/\.[^.]+$/, ''),
        imageUrl: '',
        caption: '', alt: '', category: '', featured: false, order: '', linkUrl: '',
      } as OptimisticImage;
    });

    setImages((prev) => [...prev, ...placeholders]);

    // Upload each file
    await Promise.all(
      imageFiles.map(async (file, i) => {
        const tempId = placeholders[i]._tempId!;
        try {
          const url = await uploadAndPublishImage(accessToken, file);
          const newImage: Omit<GalleryImage, 'rowIndex'> = {
            title: file.name.replace(/\.[^.]+$/, ''),
            imageUrl: url,
            caption: '', alt: '', category: '', featured: false, order: '', linkUrl: '',
          };
          await appendGalleryImages(accessToken, module.sheetId, [newImage]);

          // Reload to get accurate rowIndex
          const { images: fresh, numericSheetId: nsid } = await listGalleryImages(accessToken, module.sheetId);
          setImages(fresh);
          setNumericSheetId(nsid);
          setToast(`${file.name.replace(/\.[^.]+$/, '')} added`);
        } catch (e: unknown) {
          setImages((prev) =>
            prev.map((img) =>
              img._tempId === tempId
                ? { ...img, _uploading: false, _error: (e as Error).message }
                : img,
            ),
          );
        }
      }),
    );
  }, [accessToken, module.sheetId]);

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function handleDelete(image: OptimisticImage) {
    if (numericSheetId === null) return;
    const key = String(image.rowIndex);
    setDeletingIds((prev) => new Set(prev).add(key));
    try {
      await deleteGalleryImage(accessToken, module.sheetId, numericSheetId, image.rowIndex);
      // Reload to get corrected rowIndexes after deletion
      const { images: fresh, numericSheetId: nsid } = await listGalleryImages(accessToken, module.sheetId);
      setImages(fresh);
      setNumericSheetId(nsid);
      setToast('Image removed');
    } catch (e: unknown) {
      setToast((e as Error).message);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  // ── Drag & drop ─────────────────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }
  function onDragLeave() { setDragging(false); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {module.moduleName}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {loading ? 'Loading…' : `${images.length} image${images.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ color: 'var(--color-muted)' }}
          aria-label="Close"
        >
          <XIcon />
        </button>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 max-w-4xl w-full mx-auto">

        {/* Upload zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-colors"
          style={{
            borderColor: dragging ? 'var(--color-accent)' : 'var(--color-border)',
            background: dragging ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          aria-label="Upload images"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}
          >
            <UploadIcon />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              Drop images here or click to upload
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              JPG, PNG, GIF, WebP · Max 10 MB each · Multiple at once OK
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) handleFiles(Array.from(e.target.files));
              e.target.value = '';
            }}
          />
        </div>

        {/* Images grid */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', aspectRatio: '1' }} />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{loadError}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="rounded-xl border p-10 flex flex-col items-center gap-3 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div style={{ color: 'var(--color-border)' }}><ImagePlaceholderIcon /></div>
            <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No images yet — upload some above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            <AnimatePresence>
              {images.map((img) => (
                <motion.div
                  key={img._tempId ?? String(img.rowIndex)}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                >
                  <ImageCard
                    image={img}
                    onDelete={() => handleDelete(img)}
                    deleting={deletingIds.has(String(img.rowIndex))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Sheet link */}
        {!loading && (
          <p className="text-xs text-center" style={{ color: 'var(--color-muted)' }}>
            Need to edit titles, captions, or reorder?{' '}
            <a
              href={module.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Open the Gallery Sheet
            </a>
          </p>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
