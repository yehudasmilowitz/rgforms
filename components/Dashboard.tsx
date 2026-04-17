'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useApp } from '@/context/AppContext';
import { listAllResources, deleteForm } from '@/lib/myForms';
import { revokeToken } from '@/lib/auth';
import FormDetailModal from '@/components/FormDetailModal';
import ContentModuleDetailModal from '@/components/ContentModuleDetailModal';
import ContentEditor from '@/components/ContentEditor';
import AssetManager from '@/components/AssetManager';
import AssetDetailModal from '@/components/AssetDetailModal';
import SiteConfigDetailModal from '@/components/SiteConfigDetailModal';
import CalendarDetailModal from '@/components/CalendarDetailModal';
import GalleryDetailModal from '@/components/GalleryDetailModal';
import GalleryManager from '@/components/GalleryManager';
import CalendarManager from '@/components/CalendarManager';
import SiteConfigManager from '@/components/SiteConfigManager';
import SkillExportModal from '@/components/SkillExportModal';
import type { FormSummary, ContentModuleSummary, AssetModuleSummary, SiteConfigModuleSummary, CalendarModuleSummary, GalleryModuleSummary, ModuleSummary } from '@/types';
import UserAvatar from '@/components/UserAvatar';
import { GoogleSheetsIcon, GoogleAppsScriptIcon } from '@/components/google-icons';

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------


function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 4L1 8l4 4M11 4l4 4-4 4M9 2l-2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M11 2l3 3-8 8H3v-3L11 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 2.5A1.5 1.5 0 014.5 1H13v11H4.5A1.5 1.5 0 003 13.5v-11z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 13.5A1.5 1.5 0 004.5 15H13v-3H4.5A1.5 1.5 0 003 13.5z" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function DatabaseIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 4v4c0 1.1 2.24 2 5 2s5-.9 5-2V4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 8v4c0 1.1 2.24 2 5 2s5-.9 5-2V8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function FolderIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M1 4.5A1.5 1.5 0 012.5 3h3.086a1.5 1.5 0 011.06.44l.915.914A1.5 1.5 0 008.62 4.9H13.5A1.5 1.5 0 0115 6.4v5.1A1.5 1.5 0 0113.5 13h-11A1.5 1.5 0 011 11.5v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function SettingsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function SparklesIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M13 1l.75 2.25L16 4l-2.25.75L13 7l-.75-2.25L10 4l2.25-.75L13 1z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}

function CalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="5.5" cy="10" r="0.9" fill="currentColor"/>
      <circle cx="8" cy="10" r="0.9" fill="currentColor"/>
      <circle cx="10.5" cy="10" r="0.9" fill="currentColor"/>
    </svg>
  );
}

function GalleryIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  );
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// FormCard
// ---------------------------------------------------------------------------

interface FormCardProps {
  form: FormSummary;
  onDelete: (form: FormSummary) => void;
  onView: (form: FormSummary) => void;
  deleting: boolean;
}

function FormCard({ form, onDelete, onView, deleting }: FormCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: deleting ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Name + date */}
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            <GoogleSheetsIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              {form.formName}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Created {formatDate(form.createdAt)}
            </p>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(form)}
          disabled={deleting}
          className={clsx(
            'shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
            deleting && 'cursor-not-allowed',
          )}
          style={{
            background: 'transparent',
            borderColor: 'var(--color-border)',
            color: 'var(--color-muted)',
          }}
          onMouseEnter={(e) => {
            if (!deleting) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label={`Delete ${form.formName}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action links */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onView(form)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)';
          }}
        >
          <CodeIcon className="w-3 h-3 shrink-0" />
          Details
        </button>

        <a
          href={form.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
          }}
        >
          <GoogleSheetsIcon className="w-3 h-3 shrink-0" />
          Google Sheet
        </a>

        {form.scriptUrl && (
          <a
            href={form.scriptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background: 'var(--color-surface-2)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)';
            }}
          >
            <GoogleAppsScriptIcon className="w-3 h-3 shrink-0" />
            Apps Script
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RevokeConfirmDialog
// ---------------------------------------------------------------------------

interface RevokeConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  revoking: boolean;
  result: 'idle' | 'success' | 'error';
}

function RevokeConfirmDialog({ onConfirm, onCancel, revoking, result }: RevokeConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            {result === 'success' ? 'Permissions revoked' : 'Revoke all permissions?'}
          </h2>
          {result === 'idle' && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              This will immediately revoke RG Forms&apos; access to your Google account — Drive, Sheets, and Apps Script. Your existing forms will remain in your Drive, but you&apos;ll need to sign in again to use them here.{' '}
              You can also do this any time at{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--color-accent)' }}
              >
                myaccount.google.com/permissions
              </a>
              .
            </p>
          )}
          {result === 'success' && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
              RG Forms no longer has access to your Google account. Signing you out…
            </p>
          )}
          {result === 'error' && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-error)' }}>
              The revocation request failed — Google may be temporarily unavailable. You can try again, or manually remove RG Forms at{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'var(--color-accent)' }}
              >
                myaccount.google.com/permissions
              </a>
              .
            </p>
          )}
        </div>

        {result === 'idle' && (
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={revoking}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              {revoking ? 'Revoking…' : 'Revoke permissions'}
            </button>
            <button
              onClick={onCancel}
              disabled={revoking}
              className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
              style={{
                background: 'transparent',
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {result === 'error' && (
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
              style={{ background: '#ef4444', color: '#fff' }}
            >
              Try again
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{
                background: 'transparent',
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeleteConfirmDialog
// ---------------------------------------------------------------------------

interface DeleteConfirmProps {
  form: FormSummary;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({ form, onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
            Delete &ldquo;{form.formName}&rdquo;?
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This will permanently delete the Google Sheet and its bound Apps Script — including all form deployments. This cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-opacity focus:outline-none focus:ring-2 focus:ring-red-400"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background: 'transparent',
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ContentModuleCard
// ---------------------------------------------------------------------------

interface ContentModuleCardProps {
  module: ContentModuleSummary;
  onDelete: (m: ContentModuleSummary) => void;
  onEdit: (m: ContentModuleSummary) => void;
  onView: (m: ContentModuleSummary) => void;
  deleting: boolean;
}

function ContentModuleCard({ module, onDelete, onEdit, onView, deleting }: ContentModuleCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: deleting ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            <DatabaseIcon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {module.moduleName}
              </p>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0"
                style={{ background: 'oklch(0.78 0.18 75 / 0.12)', color: 'oklch(0.78 0.18 75)', border: '1px solid oklch(0.78 0.18 75 / 0.25)' }}
              >
                Beta
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Created {formatDate(module.createdAt)}
              {module.fields && ` · ${module.fields.length} field${module.fields.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(module)}
          disabled={deleting}
          className="shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          onMouseEnter={(e) => {
            if (!deleting) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label={`Delete ${module.moduleName}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(module)}
          disabled={deleting || !module.fields}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
        >
          <EditIcon className="w-3 h-3 shrink-0" />
          Edit content
        </button>

        <button
          type="button"
          onClick={() => onView(module)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
        >
          <BookIcon className="w-3 h-3 shrink-0" />
          Details
        </button>

        <a
          href={module.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
        >
          <GoogleSheetsIcon className="w-3 h-3 shrink-0" />
          Google Sheet
        </a>

        {module.deploymentUrl && (
          <a
            href={module.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <CodeIcon className="w-3 h-3 shrink-0" />
            API endpoint
          </a>
        )}

        {module.scriptUrl && (
          <a
            href={module.scriptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <GoogleAppsScriptIcon className="w-3 h-3 shrink-0" />
            Apps Script
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssetModuleCard
// ---------------------------------------------------------------------------

interface AssetModuleCardProps {
  module: AssetModuleSummary;
  onDelete: (m: AssetModuleSummary) => void;
  onManage: (m: AssetModuleSummary) => void;
  onView: (m: AssetModuleSummary) => void;
  deleting: boolean;
}

function AssetModuleCard({ module, onDelete, onManage, onView, deleting }: AssetModuleCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: deleting ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'oklch(0.78 0.18 75 / 0.10)', border: '1px solid oklch(0.78 0.18 75 / 0.25)' }}
          >
            <FolderIcon className="w-4 h-4" style={{ color: 'oklch(0.78 0.18 75)' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {module.moduleName}
              </p>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0"
                style={{ background: 'oklch(0.78 0.18 75 / 0.12)', color: 'oklch(0.78 0.18 75)', border: '1px solid oklch(0.78 0.18 75 / 0.25)' }}
              >
                Beta
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Created {formatDate(module.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(module)}
          disabled={deleting}
          className="shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          onMouseEnter={(e) => {
            if (!deleting) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label={`Delete ${module.moduleName}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(module)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
        >
          <CodeIcon className="w-3 h-3 shrink-0" />
          Details
        </button>

        {module.deploymentUrl && (
          <button
            type="button"
            onClick={() => onManage(module)}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          >
            <FolderIcon className="w-3 h-3 shrink-0" />
            Manage files
          </button>
        )}

        {module.folderUrl && (
          <a
            href={module.folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <FolderIcon className="w-3 h-3 shrink-0" />
            Drive folder
          </a>
        )}

        {module.deploymentUrl && (
          <a
            href={module.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <CodeIcon className="w-3 h-3 shrink-0" />
            API endpoint
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SiteConfigModuleCard
// ---------------------------------------------------------------------------

interface SiteConfigModuleCardProps {
  module: SiteConfigModuleSummary;
  onDelete: (m: SiteConfigModuleSummary) => void;
  onManage: (m: SiteConfigModuleSummary) => void;
  onView: (m: SiteConfigModuleSummary) => void;
  deleting: boolean;
}

function SiteConfigModuleCard({ module, onDelete, onManage, onView, deleting }: SiteConfigModuleCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        opacity: deleting ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'oklch(0.65 0.22 290 / 0.10)', border: '1px solid oklch(0.65 0.22 290 / 0.25)' }}
          >
            <SettingsIcon className="w-4 h-4" style={{ color: 'oklch(0.72 0.18 290)' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {module.moduleName}
              </p>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0"
                style={{ background: 'oklch(0.65 0.22 290 / 0.12)', color: 'oklch(0.72 0.18 290)', border: '1px solid oklch(0.65 0.22 290 / 0.25)' }}
              >
                Config
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              Created {formatDate(module.createdAt)}
            </p>
          </div>
        </div>

        <button
          onClick={() => onDelete(module)}
          disabled={deleting}
          className="shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          onMouseEnter={(e) => {
            if (!deleting) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
          aria-label={`Delete ${module.moduleName}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onManage(module)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'oklch(0.65 0.22 290 / 0.10)', borderColor: 'oklch(0.65 0.22 290 / 0.30)', color: 'oklch(0.72 0.18 290)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.65 0.22 290)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.65 0.22 290 / 0.10)'; (e.currentTarget as HTMLButtonElement).style.color = 'oklch(0.72 0.18 290)'; }}
        >
          Edit config
        </button>
        <button
          type="button"
          onClick={() => onView(module)}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
        >
          <BookIcon className="w-3 h-3 shrink-0" />
          Details
        </button>

        <a
          href={module.sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
        >
          <GoogleSheetsIcon className="w-3 h-3 shrink-0" />
          Config Sheet
        </a>

        {module.deploymentUrl && (
          <a
            href={module.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <CodeIcon className="w-3 h-3 shrink-0" />
            API endpoint
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalendarModuleCard
// ---------------------------------------------------------------------------

interface CalendarModuleCardProps {
  module: CalendarModuleSummary;
  onDelete: (m: CalendarModuleSummary) => void;
  onManage: (m: CalendarModuleSummary) => void;
  onView: (m: CalendarModuleSummary) => void;
  deleting: boolean;
}

function CalendarModuleCard({ module, onDelete, onManage, onView, deleting }: CalendarModuleCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', opacity: deleting ? 0.5 : 1, transition: 'opacity 0.2s' }}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.55 0.20 270 / 0.10)', border: '1px solid oklch(0.55 0.20 270 / 0.25)' }}>
            <CalendarIcon className="w-4 h-4" style={{ color: 'oklch(0.65 0.18 270)' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{module.moduleName}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0" style={{ background: 'oklch(0.55 0.20 270 / 0.12)', color: 'oklch(0.65 0.18 270)', border: '1px solid oklch(0.55 0.20 270 / 0.25)' }}>
                Calendar
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Created {formatDate(module.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(module)}
          disabled={deleting}
          className="shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          onMouseEnter={(e) => { if (!deleting) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; } }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label={`Delete ${module.moduleName}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onManage(module)} disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'oklch(0.55 0.20 270 / 0.10)', borderColor: 'oklch(0.55 0.20 270 / 0.30)', color: 'oklch(0.65 0.18 270)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.55 0.20 270)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.55 0.20 270 / 0.10)'; (e.currentTarget as HTMLButtonElement).style.color = 'oklch(0.65 0.18 270)'; }}
        >
          Manage events
        </button>
        <button type="button" onClick={() => onView(module)} disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
        >
          <BookIcon className="w-3 h-3 shrink-0" />
          Details
        </button>
        <a href={module.sheetUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
        >
          <GoogleSheetsIcon className="w-3 h-3 shrink-0" />
          Events Sheet
        </a>
        {module.deploymentUrl && (
          <a href={module.deploymentUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <CodeIcon className="w-3 h-3 shrink-0" />
            API endpoint
          </a>
        )}
        {module.scriptUrl && (
          <a href={module.scriptUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <GoogleAppsScriptIcon className="w-3 h-3 shrink-0" />
            Apps Script
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GalleryModuleCard
// ---------------------------------------------------------------------------

interface GalleryModuleCardProps {
  module: GalleryModuleSummary;
  onDelete: (m: GalleryModuleSummary) => void;
  onManage: (m: GalleryModuleSummary) => void;
  onView: (m: GalleryModuleSummary) => void;
  deleting: boolean;
}

function GalleryModuleCard({ module, onDelete, onManage, onView, deleting }: GalleryModuleCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', opacity: deleting ? 0.5 : 1, transition: 'opacity 0.2s' }}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'oklch(0.55 0.20 150 / 0.10)', border: '1px solid oklch(0.55 0.20 150 / 0.25)' }}>
            <GalleryIcon className="w-4 h-4" style={{ color: 'oklch(0.65 0.18 150)' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{module.moduleName}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0" style={{ background: 'oklch(0.55 0.20 150 / 0.12)', color: 'oklch(0.65 0.18 150)', border: '1px solid oklch(0.55 0.20 150 / 0.25)' }}>
                Gallery
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Created {formatDate(module.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={() => onDelete(module)}
          disabled={deleting}
          className="shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          onMouseEnter={(e) => { if (!deleting) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; } }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label={`Delete ${module.moduleName}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {module.deploymentUrl && (
          <button type="button" onClick={() => onManage(module)} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
            style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          >
            <GalleryIcon className="w-3 h-3 shrink-0" />
            Manage images
          </button>
        )}
        <button type="button" onClick={() => onView(module)} disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
        >
          <BookIcon className="w-3 h-3 shrink-0" />
          Details
        </button>
        <a href={module.sheetUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
        >
          <GoogleSheetsIcon className="w-3 h-3 shrink-0" />
          Gallery Sheet
        </a>
        {module.deploymentUrl && (
          <a href={module.deploymentUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <CodeIcon className="w-3 h-3 shrink-0" />
            API endpoint
          </a>
        )}
        {module.scriptUrl && (
          <a href={module.scriptUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <GoogleAppsScriptIcon className="w-3 h-3 shrink-0" />
            Apps Script
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SimpleModuleCard
// ---------------------------------------------------------------------------

interface SimpleModuleCardProps {
  name: string;
  createdAt: string;
  deploymentUrl?: string;
  sheetUrl: string;
  scriptUrl?: string;
  typeLabel: string;
  typeBgColor: string;
  typeTextColor: string;
  onDelete: () => void;
  deleting: boolean;
}

function SimpleModuleCard({ name, createdAt, deploymentUrl, sheetUrl, scriptUrl, typeLabel, typeBgColor, typeTextColor, onDelete, deleting }: SimpleModuleCardProps) {
  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', opacity: deleting ? 0.5 : 1, transition: 'opacity 0.2s' }}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: typeBgColor, border: `1px solid ${typeTextColor}40` }}>
            <DatabaseIcon className="w-4 h-4" style={{ color: typeTextColor }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{name}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0" style={{ background: typeBgColor, color: typeTextColor, border: `1px solid ${typeTextColor}40` }}>
                {typeLabel}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Created {formatDate(createdAt)}</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="shrink-0 p-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          onMouseEnter={(e) => { if (!deleting) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; } }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          aria-label={`Delete ${name}`}
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
        >
          <GoogleSheetsIcon className="w-3 h-3 shrink-0" />
          Google Sheet
        </a>
        {deploymentUrl && (
          <a href={deploymentUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <CodeIcon className="w-3 h-3 shrink-0" />
            API endpoint
          </a>
        )}
        {scriptUrl && (
          <a href={scriptUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)'; }}
          >
            <GoogleAppsScriptIcon className="w-3 h-3 shrink-0" />
            Apps Script
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GenericDeleteDialog
// ---------------------------------------------------------------------------

interface GenericDeleteDialogProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function GenericDeleteDialog({ name, onConfirm, onCancel }: GenericDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Delete &ldquo;{name}&rdquo;?</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            This will permanently delete the Google Sheet and its bound Apps Script. The endpoint will stop working. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400" style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const user = state.auth.user!;
  const accessToken = state.auth.accessToken!;

  const [activeTab, setActiveTab] = useState<'forms' | 'content' | 'assets' | 'config' | 'calendar' | 'gallery' | 'testimonials' | 'faqs' | 'menus' | 'newsletters' | 'announcements' | 'redirects'>('forms');
  const [betaDropdownOpen, setBetaDropdownOpen] = useState(false);
  const [skillExportOpen, setSkillExportOpen] = useState(false);

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [formsError, setFormsError] = useState<string | null>(null);

  const [modules, setModules] = useState<ContentModuleSummary[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<ContentModuleSummary | null>(null);
  const [modulesError, setModulesError] = useState<string | null>(null);

  const [assets, setAssets] = useState<AssetModuleSummary[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<AssetModuleSummary | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetModuleSummary | null>(null);
  const [pendingDeleteAsset, setPendingDeleteAsset] = useState<AssetModuleSummary | null>(null);

  const [configs, setConfigs] = useState<SiteConfigModuleSummary[]>([]);
  const [configsLoading, setConfigsLoading] = useState(true);
  const [configsError, setConfigsError] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<SiteConfigModuleSummary | null>(null);
  const [pendingDeleteConfig, setPendingDeleteConfig] = useState<SiteConfigModuleSummary | null>(null);
  const [editingConfig, setEditingConfig] = useState<SiteConfigModuleSummary | null>(null);

  const [calendars, setCalendars] = useState<CalendarModuleSummary[]>([]);
  const [calendarsLoading, setCalendarsLoading] = useState(true);
  const [calendarsError, setCalendarsError] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarModuleSummary | null>(null);
  const [pendingDeleteCalendar, setPendingDeleteCalendar] = useState<CalendarModuleSummary | null>(null);
  const [editingCalendar, setEditingCalendar] = useState<CalendarModuleSummary | null>(null);

  const [galleries, setGalleries] = useState<GalleryModuleSummary[]>([]);
  const [galleriesLoading, setGalleriesLoading] = useState(true);
  const [galleriesError, setGalleriesError] = useState<string | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryModuleSummary | null>(null);
  const [pendingDeleteGallery, setPendingDeleteGallery] = useState<GalleryModuleSummary | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryModuleSummary | null>(null);

  const [testimonials, setTestimonials] = useState<ModuleSummary[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [pendingDeleteTestimonial, setPendingDeleteTestimonial] = useState<ModuleSummary | null>(null);

  const [faqs, setFaqs] = useState<ModuleSummary[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [pendingDeleteFaq, setPendingDeleteFaq] = useState<ModuleSummary | null>(null);

  const [menus, setMenus] = useState<ModuleSummary[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [pendingDeleteMenu, setPendingDeleteMenu] = useState<ModuleSummary | null>(null);

  const [newsletters, setNewsletters] = useState<ModuleSummary[]>([]);
  const [newslettersLoading, setNewslettersLoading] = useState(true);
  const [pendingDeleteNewsletter, setPendingDeleteNewsletter] = useState<ModuleSummary | null>(null);

  const [announcements, setAnnouncements] = useState<ModuleSummary[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [pendingDeleteAnnouncement, setPendingDeleteAnnouncement] = useState<ModuleSummary | null>(null);

  const [redirectsList, setRedirectsList] = useState<ModuleSummary[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(true);
  const [pendingDeleteRedirects, setPendingDeleteRedirects] = useState<ModuleSummary | null>(null);

  // Keep legacy name for forms section
  const loading = formsLoading;
  const loadError = formsError;

  // The form whose details modal is open
  const [selectedForm, setSelectedForm] = useState<FormSummary | null>(null);
  // The module whose instructions modal is open
  const [selectedModule, setSelectedModule] = useState<ContentModuleSummary | null>(null);
  // The form pending deletion confirmation
  const [pendingDelete, setPendingDelete] = useState<FormSummary | null>(null);
  // Module pending deletion
  const [pendingDeleteModule, setPendingDeleteModule] = useState<ContentModuleSummary | null>(null);
  // IDs currently being deleted (for optimistic UI)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  // Revoke permissions flow
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeResult, setRevokeResult] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const controller = new AbortController();
    setFormsLoading(true); setFormsError(null);
    setModulesLoading(true); setModulesError(null);
    setAssetsLoading(true); setAssetsError(null);
    setConfigsLoading(true); setConfigsError(null);
    setCalendarsLoading(true); setCalendarsError(null);
    setGalleriesLoading(true); setGalleriesError(null);
    setTestimonialsLoading(true);
    setFaqsLoading(true);
    setMenusLoading(true);
    setNewslettersLoading(true);
    setAnnouncementsLoading(true);
    setRedirectsLoading(true);

    listAllResources(accessToken, state.selectedProject!.sheetId, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setForms(result.forms); setFormsLoading(false);
        setModules(result.modules); setModulesLoading(false);
        setAssets(result.assets); setAssetsLoading(false);
        setConfigs(result.configs); setConfigsLoading(false);
        setCalendars(result.calendars); setCalendarsLoading(false);
        setGalleries(result.galleries); setGalleriesLoading(false);
        setTestimonials(result.testimonials); setTestimonialsLoading(false);
        setFaqs(result.faqs); setFaqsLoading(false);
        setMenus(result.menus); setMenusLoading(false);
        setNewsletters(result.newsletters); setNewslettersLoading(false);
        setAnnouncements(result.announcements); setAnnouncementsLoading(false);
        setRedirectsList(result.redirects); setRedirectsLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        void err;
        setFormsError('Could not load your resources. Please try again.'); setFormsLoading(false);
        setModulesError('Could not load content modules. Please try again.'); setModulesLoading(false);
        setAssetsError('Could not load asset modules. Please try again.'); setAssetsLoading(false);
        setConfigsError('Could not load site configs. Please try again.'); setConfigsLoading(false);
        setCalendarsError('Could not load calendars. Please try again.'); setCalendarsLoading(false);
        setGalleriesError('Could not load galleries. Please try again.'); setGalleriesLoading(false);
        setTestimonialsLoading(false);
        setFaqsLoading(false);
        setMenusLoading(false);
        setNewslettersLoading(false);
        setAnnouncementsLoading(false);
        setRedirectsLoading(false);
      });

    return () => { controller.abort(); };
  }, [accessToken, state.selectedProject]);

  function handleRefreshAll() {
    setFormsLoading(true); setFormsError(null);
    setModulesLoading(true); setModulesError(null);
    setAssetsLoading(true); setAssetsError(null);
    setConfigsLoading(true); setConfigsError(null);
    setCalendarsLoading(true); setCalendarsError(null);
    setGalleriesLoading(true); setGalleriesError(null);
    setTestimonialsLoading(true);
    setFaqsLoading(true);
    setMenusLoading(true);
    setNewslettersLoading(true);
    setAnnouncementsLoading(true);
    setRedirectsLoading(true);
    listAllResources(accessToken, state.selectedProject!.sheetId)
      .then((result) => {
        setForms(result.forms); setFormsLoading(false);
        setModules(result.modules); setModulesLoading(false);
        setAssets(result.assets); setAssetsLoading(false);
        setConfigs(result.configs); setConfigsLoading(false);
        setCalendars(result.calendars); setCalendarsLoading(false);
        setGalleries(result.galleries); setGalleriesLoading(false);
        setTestimonials(result.testimonials); setTestimonialsLoading(false);
        setFaqs(result.faqs); setFaqsLoading(false);
        setMenus(result.menus); setMenusLoading(false);
        setNewsletters(result.newsletters); setNewslettersLoading(false);
        setAnnouncements(result.announcements); setAnnouncementsLoading(false);
        setRedirectsList(result.redirects); setRedirectsLoading(false);
      })
      .catch(() => {
        setFormsError('Could not load your resources. Please try again.'); setFormsLoading(false);
        setModulesError('Could not load content modules. Please try again.'); setModulesLoading(false);
        setAssetsError('Could not load asset modules. Please try again.'); setAssetsLoading(false);
        setConfigsError('Could not load site configs. Please try again.'); setConfigsLoading(false);
        setCalendarsError('Could not load calendars. Please try again.'); setCalendarsLoading(false);
        setGalleriesError('Could not load galleries. Please try again.'); setGalleriesLoading(false);
        setTestimonialsLoading(false);
        setFaqsLoading(false);
        setMenusLoading(false);
        setNewslettersLoading(false);
        setAnnouncementsLoading(false);
        setRedirectsLoading(false);
      });
  }

  async function handleConfirmDeleteAsset() {
    if (!pendingDeleteAsset) return;
    const mod = pendingDeleteAsset;
    setPendingDeleteAsset(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));

    try {
      await deleteForm(accessToken, mod.sheetId);
      setAssets((prev) => prev.filter((a) => a.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(mod.sheetId);
        return next;
      });
    }
  }

  async function handleConfirmDeleteCalendar() {
    if (!pendingDeleteCalendar) return;
    const mod = pendingDeleteCalendar;
    setPendingDeleteCalendar(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));

    try {
      await deleteForm(accessToken, mod.sheetId);
      setCalendars((prev) => prev.filter((c) => c.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(mod.sheetId);
        return next;
      });
    }
  }

  async function handleConfirmDeleteGallery() {
    if (!pendingDeleteGallery) return;
    const mod = pendingDeleteGallery;
    setPendingDeleteGallery(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));

    try {
      await deleteForm(accessToken, mod.sheetId);
      setGalleries((prev) => prev.filter((g) => g.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(mod.sheetId);
        return next;
      });
    }
  }

  async function handleConfirmDeleteTestimonial() {
    if (!pendingDeleteTestimonial) return;
    const mod = pendingDeleteTestimonial;
    setPendingDeleteTestimonial(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));
    try {
      await deleteForm(accessToken, mod.sheetId);
      setTestimonials((prev) => prev.filter((t) => t.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(mod.sheetId); return next; });
    }
  }

  async function handleConfirmDeleteFaq() {
    if (!pendingDeleteFaq) return;
    const mod = pendingDeleteFaq;
    setPendingDeleteFaq(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));
    try {
      await deleteForm(accessToken, mod.sheetId);
      setFaqs((prev) => prev.filter((f) => f.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(mod.sheetId); return next; });
    }
  }

  async function handleConfirmDeleteMenu() {
    if (!pendingDeleteMenu) return;
    const mod = pendingDeleteMenu;
    setPendingDeleteMenu(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));
    try {
      await deleteForm(accessToken, mod.sheetId);
      setMenus((prev) => prev.filter((m) => m.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(mod.sheetId); return next; });
    }
  }

  async function handleConfirmDeleteNewsletter() {
    if (!pendingDeleteNewsletter) return;
    const mod = pendingDeleteNewsletter;
    setPendingDeleteNewsletter(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));
    try {
      await deleteForm(accessToken, mod.sheetId);
      setNewsletters((prev) => prev.filter((n) => n.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(mod.sheetId); return next; });
    }
  }

  async function handleConfirmDeleteAnnouncement() {
    if (!pendingDeleteAnnouncement) return;
    const mod = pendingDeleteAnnouncement;
    setPendingDeleteAnnouncement(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));
    try {
      await deleteForm(accessToken, mod.sheetId);
      setAnnouncements((prev) => prev.filter((a) => a.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(mod.sheetId); return next; });
    }
  }

  async function handleConfirmDeleteRedirects() {
    if (!pendingDeleteRedirects) return;
    const mod = pendingDeleteRedirects;
    setPendingDeleteRedirects(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));
    try {
      await deleteForm(accessToken, mod.sheetId);
      setRedirectsList((prev) => prev.filter((r) => r.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(mod.sheetId); return next; });
    }
  }

  async function handleConfirmDeleteConfig() {
    if (!pendingDeleteConfig) return;
    const mod = pendingDeleteConfig;
    setPendingDeleteConfig(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));

    try {
      await deleteForm(accessToken, mod.sheetId);
      setConfigs((prev) => prev.filter((c) => c.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(mod.sheetId);
        return next;
      });
    }
  }

  async function handleConfirmRevoke() {
    setRevoking(true);
    const succeeded = await revokeToken(accessToken);
    setRevoking(false);
    if (succeeded) {
      setRevokeResult('success');
      setTimeout(() => dispatch({ type: 'SIGN_OUT' }), 1500);
    } else {
      setRevokeResult('error');
    }
  }

  function handleCloseRevokeDialog() {
    setRevokeConfirmOpen(false);
    setRevokeResult('idle');
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    const form = pendingDelete;
    setPendingDelete(null);
    setDeletingIds((prev) => new Set(prev).add(form.sheetId));

    try {
      await deleteForm(accessToken, form.sheetId);
      setForms((prev) => prev.filter((f) => f.sheetId !== form.sheetId));
    } catch {
      // If delete fails, just remove from deleting set so it re-appears
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(form.sheetId);
        return next;
      });
    }
  }

  async function handleConfirmDeleteModule() {
    if (!pendingDeleteModule) return;
    const mod = pendingDeleteModule;
    setPendingDeleteModule(null);
    setDeletingIds((prev) => new Set(prev).add(mod.sheetId));

    try {
      await deleteForm(accessToken, mod.sheetId); // same Drive delete
      setModules((prev) => prev.filter((m) => m.sheetId !== mod.sheetId));
    } catch { /* silent */ } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(mod.sheetId);
        return next;
      });
    }
  }

  return (
    <motion.main
      className="min-h-screen flex flex-col px-4 py-8"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header bar */}
        <header
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <UserAvatar name={user.name} picture={user.picture} />
            <div className="hidden sm:flex flex-col min-w-0">
              <span className="text-xs font-medium truncate leading-none" style={{ color: 'var(--color-text)' }}>
                {user.name}
              </span>
              <span className="text-xs truncate leading-none mt-0.5" style={{ color: 'var(--color-muted)' }}>
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSkillExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)'; }}
              title="Generate a CLAUDE.md / .cursorrules with all your real endpoints and schemas"
            >
              <SparklesIcon className="w-3 h-3 shrink-0" />
              AI Skill
            </button>
            <button
              type="button"
              onClick={() => { setRevokeResult('idle'); setRevokeConfirmOpen(true); }}
              className={clsx(
                'px-3 py-1.5 rounded-lg border text-xs font-medium',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-red-400',
              )}
              style={{
                background: 'transparent',
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.5)';
                (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              Revoke permissions
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'SIGN_OUT' })}
              className={clsx(
                'px-3 py-1.5 rounded-lg border text-xs font-medium',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]',
              )}
              style={{
                background: 'transparent',
                borderColor: 'var(--color-border)',
                color: 'var(--color-muted)',
              }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Project context bar */}
        {state.selectedProject && (
          <div
            className="rounded-xl border px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--color-muted)' }} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M1 4.5A1.5 1.5 0 012.5 3h3.086a1.5 1.5 0 011.06.44l.915.914A1.5 1.5 0 008.62 4.9H13.5A1.5 1.5 0 0115 6.4v5.1A1.5 1.5 0 0113.5 13h-11A1.5 1.5 0 011 11.5v-7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                {state.selectedProject.projectName}
              </span>
              {state.selectedProject.deploymentUrl && (
                <a
                  href={state.selectedProject.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs px-2 py-0.5 rounded-full border transition-colors"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                  title="Open project API"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent-border)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)'; }}
                >
                  API ↗
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'BACK_TO_PROJECTS' })}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-text)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
            >
              ← All projects
            </button>
          </div>
        )}

        {/* Site Starter CTA */}
        <div className="rounded-xl border p-4 flex items-center justify-between gap-4"
          style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Launch a complete site backend</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Pick a template and spin up all your APIs in 60 seconds</p>
          </div>
          <button onClick={() => dispatch({ type: 'GO_TO_SITE_STARTER' })}
            className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--color-accent)', color: '#000' }}>
            Site Starter
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {/* Forms tab */}
          <button
            type="button"
            onClick={() => setActiveTab('forms')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            style={{
              background: activeTab === 'forms' ? 'var(--color-surface-2)' : 'transparent',
              color: activeTab === 'forms' ? 'var(--color-text)' : 'var(--color-muted)',
              border: activeTab === 'forms' ? '1px solid var(--color-border)' : '1px solid transparent',
            }}
          >
            <GoogleSheetsIcon className="w-3.5 h-3.5 shrink-0" />
            Forms
            {forms.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'var(--color-border)', color: 'var(--color-muted)' }}>
                {forms.length}
              </span>
            )}
          </button>

          {/* Beta Features dropdown — uses a portal-style fixed dropdown to avoid overflow clipping */}
          <div className="flex-1 relative">
            <button
              type="button"
              onClick={() => setBetaDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{
                background: ['content', 'assets', 'config', 'calendar', 'gallery', 'testimonials', 'faqs', 'menus', 'newsletters', 'announcements', 'redirects'].includes(activeTab) ? 'var(--color-surface-2)' : 'transparent',
                color: ['content', 'assets', 'config', 'calendar', 'gallery', 'testimonials', 'faqs', 'menus', 'newsletters', 'announcements', 'redirects'].includes(activeTab) ? 'var(--color-text)' : 'var(--color-muted)',
                border: ['content', 'assets', 'config', 'calendar', 'gallery', 'testimonials', 'faqs', 'menus', 'newsletters', 'announcements', 'redirects'].includes(activeTab) ? '1px solid var(--color-border)' : '1px solid transparent',
              }}
            >
              <span className="text-xs px-1 py-0 rounded font-semibold tracking-wide" style={{ background: 'oklch(0.65 0.18 270 / 0.15)', color: 'oklch(0.55 0.18 270)' }}>β</span>
              Beta Features
              <svg
                className="w-3 h-3 shrink-0 transition-transform"
                style={{ transform: betaDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                viewBox="0 0 12 12" fill="none"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {betaDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setBetaDropdownOpen(false)} />
                <div
                  className="absolute left-0 top-full mt-1 z-20 flex flex-col rounded-xl p-1 w-full min-w-[160px]"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                >
                  {([
                    { id: 'content',       icon: <DatabaseIcon  className="w-3.5 h-3.5 shrink-0" />, label: 'Content',       count: modules.length },
                    { id: 'assets',        icon: <FolderIcon    className="w-3.5 h-3.5 shrink-0" />, label: 'Assets',        count: assets.length },
                    { id: 'config',        icon: <SettingsIcon  className="w-3.5 h-3.5 shrink-0" />, label: 'Config',        count: configs.length },
                    { id: 'calendar',      icon: <CalendarIcon  className="w-3.5 h-3.5 shrink-0" />, label: 'Calendar',      count: calendars.length },
                    { id: 'gallery',       icon: <GalleryIcon   className="w-3.5 h-3.5 shrink-0" />, label: 'Gallery',       count: galleries.length },
                    { id: 'testimonials',  icon: <SparklesIcon  className="w-3.5 h-3.5 shrink-0" />, label: 'Testimonials',  count: testimonials.length },
                    { id: 'faqs',          icon: <BookIcon      className="w-3.5 h-3.5 shrink-0" />, label: 'FAQs',          count: faqs.length },
                    { id: 'menus',         icon: <DatabaseIcon  className="w-3.5 h-3.5 shrink-0" />, label: 'Menu',          count: menus.length },
                    { id: 'newsletters',   icon: <EditIcon      className="w-3.5 h-3.5 shrink-0" />, label: 'Newsletter',    count: newsletters.length },
                    { id: 'announcements', icon: <CodeIcon      className="w-3.5 h-3.5 shrink-0" />, label: 'Announcements', count: announcements.length },
                    { id: 'redirects',     icon: <SettingsIcon  className="w-3.5 h-3.5 shrink-0" />, label: 'Redirects',     count: redirectsList.length },
                  ] as const).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setActiveTab(item.id); setBetaDropdownOpen(false); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-left w-full"
                      style={{
                        background: activeTab === item.id ? 'var(--color-accent-subtle)' : 'transparent',
                        color: activeTab === item.id ? 'var(--color-accent)' : 'var(--color-muted)',
                      }}
                    >
                      {item.icon}
                      {item.label}
                      {item.count > 0 && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'var(--color-border)', color: 'var(--color-muted)' }}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Forms tab ── */}
        {activeTab === 'forms' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>My Forms</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Contact forms backed by your Google Drive</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_BUILDER' })}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                New form
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                ))}
              </div>
            ) : loadError ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{loadError}</p>
                <button
                  onClick={handleRefreshAll}
                  className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}
                >Try again</button>
              </div>
            ) : forms.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <GoogleSheetsIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No forms yet</p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>Create your first form to get started.</p>
                </div>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_BUILDER' })} className="mt-1 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  Create your first form
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {forms.map((form, index) => (
                  <motion.div key={form.sheetId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}>
                    <FormCard form={form} onDelete={setPendingDelete} onView={setSelectedForm} deleting={deletingIds.has(form.sheetId)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Content tab ── */}
        {activeTab === 'content' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Content Modules</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Google Sheets as live read/write content APIs</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_CONTENT_BUILDER' })}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                New module
              </button>
            </div>

            {modulesLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                ))}
              </div>
            ) : modulesError ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{modulesError}</p>
                <button onClick={handleRefreshAll} className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}>Try again</button>
              </div>
            ) : modules.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                  <DatabaseIcon className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No content modules yet</p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                    Create a content module to turn a Google Sheet into a live read/write API for your website.
                  </p>
                </div>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_CONTENT_BUILDER' })} className="mt-1 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  Create your first module
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {modules.map((mod, index) => (
                  <motion.div key={mod.sheetId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}>
                    <ContentModuleCard module={mod} onDelete={setPendingDeleteModule} onEdit={setEditingModule} onView={setSelectedModule} deleting={deletingIds.has(mod.sheetId)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Assets tab ── */}
        {activeTab === 'assets' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>My Assets</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Public Drive folders with listing API endpoints</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_ASSET_BUILDER' })}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                New asset module
              </button>
            </div>

            {assetsLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                ))}
              </div>
            ) : assetsError ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{assetsError}</p>
                <button onClick={handleRefreshAll} className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}>Try again</button>
              </div>
            ) : assets.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.78 0.18 75 / 0.10)', border: '1px solid oklch(0.78 0.18 75 / 0.25)' }}>
                  <FolderIcon className="w-6 h-6" style={{ color: 'oklch(0.78 0.18 75)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No asset modules yet</p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                    Create an asset module to provision a public Drive folder with a listing API endpoint.
                  </p>
                </div>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_ASSET_BUILDER' })} className="mt-1 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  Create your first asset module
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {assets.map((asset, index) => (
                  <motion.div key={asset.sheetId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}>
                    <AssetModuleCard module={asset} onDelete={setPendingDeleteAsset} onManage={setEditingAsset} onView={setSelectedAsset} deleting={deletingIds.has(asset.sheetId)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Config tab ── */}
        {activeTab === 'config' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Site Configs</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Key-value settings backed by a Google Sheet</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_SITECONFIG_BUILDER' })}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                New config
              </button>
            </div>

            {configsLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                ))}
              </div>
            ) : configsError ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{configsError}</p>
                <button onClick={handleRefreshAll} className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}>Try again</button>
              </div>
            ) : configs.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.65 0.22 290 / 0.10)', border: '1px solid oklch(0.65 0.22 290 / 0.25)' }}>
                  <SettingsIcon className="w-6 h-6" style={{ color: 'oklch(0.72 0.18 290)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No site configs yet</p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                    Create a site config to turn a Google Sheet into a live key-value API your clients can edit directly.
                  </p>
                </div>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_SITECONFIG_BUILDER' })} className="mt-1 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  Create your first site config
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {configs.map((config, index) => (
                  <motion.div key={config.sheetId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}>
                    <SiteConfigModuleCard module={config} onDelete={setPendingDeleteConfig} onManage={setEditingConfig} onView={setSelectedConfig} deleting={deletingIds.has(config.sheetId)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Calendar tab ── */}
        {activeTab === 'calendar' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Calendars</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Google Sheets as event APIs with date filtering</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_CALENDAR_BUILDER' })}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                New calendar
              </button>
            </div>

            {calendarsLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                ))}
              </div>
            ) : calendarsError ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{calendarsError}</p>
                <button onClick={handleRefreshAll} className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}>Try again</button>
              </div>
            ) : calendars.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.55 0.20 270 / 0.10)', border: '1px solid oklch(0.55 0.20 270 / 0.25)' }}>
                  <CalendarIcon className="w-6 h-6" style={{ color: 'oklch(0.65 0.18 270)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No calendars yet</p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                    Create a calendar module to manage events in a Google Sheet with a JSON API for upcoming, past, and filtered events.
                  </p>
                </div>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_CALENDAR_BUILDER' })} className="mt-1 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  Create your first calendar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {calendars.map((cal, index) => (
                  <motion.div key={cal.sheetId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}>
                    <CalendarModuleCard module={cal} onDelete={setPendingDeleteCalendar} onManage={setEditingCalendar} onView={setSelectedCalendar} deleting={deletingIds.has(cal.sheetId)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Gallery tab ── */}
        {activeTab === 'gallery' && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Galleries</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Google Sheets as image gallery APIs</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_GALLERY_BUILDER' })}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)'; }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                New gallery
              </button>
            </div>

            {galleriesLoading ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />
                ))}
              </div>
            ) : galleriesError ? (
              <div className="rounded-xl border p-6 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-error)' }}>{galleriesError}</p>
                <button onClick={handleRefreshAll} className="mt-3 text-xs underline" style={{ color: 'var(--color-muted)' }}>Try again</button>
              </div>
            ) : galleries.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'oklch(0.55 0.20 150 / 0.10)', border: '1px solid oklch(0.55 0.20 150 / 0.25)' }}>
                  <GalleryIcon className="w-6 h-6" style={{ color: 'oklch(0.65 0.18 150)' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No galleries yet</p>
                  <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--color-muted)' }}>
                    Create a gallery module to manage images in a Google Sheet with a JSON API supporting search, categories, and featured images.
                  </p>
                </div>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_GALLERY_BUILDER' })} className="mt-1 px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>
                  Create your first gallery
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {galleries.map((gallery, index) => (
                  <motion.div key={gallery.sheetId} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.35 }}>
                    <GalleryModuleCard module={gallery} onDelete={setPendingDeleteGallery} onManage={setEditingGallery} onView={setSelectedGallery} deleting={deletingIds.has(gallery.sheetId)} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        {/* ── Testimonials tab ── */}
        {activeTab === 'testimonials' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Testimonials</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'testimonial' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <PlusIcon className="w-3 h-3" /> New
              </button>
            </div>
            {testimonialsLoading ? (
              <div className="flex flex-col gap-3">{[0, 1].map((i) => <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />)}</div>
            ) : testimonials.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No testimonial modules yet</p>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'testimonial' })} className="px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>Create your first testimonials module</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {testimonials.map((t) => (
                  <SimpleModuleCard key={t.sheetId} name={t.moduleName} createdAt={t.createdAt} deploymentUrl={t.deploymentUrl} sheetUrl={t.sheetUrl} scriptUrl={t.scriptUrl} typeLabel="Testimonials" typeBgColor="oklch(0.72 0.17 15 / 0.10)" typeTextColor="oklch(0.72 0.17 15)" onDelete={() => setPendingDeleteTestimonial(t)} deleting={deletingIds.has(t.sheetId)} />
                ))}
              </div>
            )}
            {pendingDeleteTestimonial && (
              <GenericDeleteDialog name={pendingDeleteTestimonial.moduleName} onConfirm={handleConfirmDeleteTestimonial} onCancel={() => setPendingDeleteTestimonial(null)} />
            )}
          </div>
        )}

        {/* ── FAQs tab ── */}
        {activeTab === 'faqs' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>FAQs</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'faq' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <PlusIcon className="w-3 h-3" /> New
              </button>
            </div>
            {faqsLoading ? (
              <div className="flex flex-col gap-3">{[0, 1].map((i) => <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />)}</div>
            ) : faqs.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No FAQ modules yet</p>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'faq' })} className="px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>Create your first FAQ module</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {faqs.map((f) => (
                  <SimpleModuleCard key={f.sheetId} name={f.moduleName} createdAt={f.createdAt} deploymentUrl={f.deploymentUrl} sheetUrl={f.sheetUrl} scriptUrl={f.scriptUrl} typeLabel="FAQ" typeBgColor="oklch(0.75 0.18 55 / 0.10)" typeTextColor="oklch(0.75 0.18 55)" onDelete={() => setPendingDeleteFaq(f)} deleting={deletingIds.has(f.sheetId)} />
                ))}
              </div>
            )}
            {pendingDeleteFaq && (
              <GenericDeleteDialog name={pendingDeleteFaq.moduleName} onConfirm={handleConfirmDeleteFaq} onCancel={() => setPendingDeleteFaq(null)} />
            )}
          </div>
        )}

        {/* ── Menus tab ── */}
        {activeTab === 'menus' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Menu / Catalog</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'menu' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <PlusIcon className="w-3 h-3" /> New
              </button>
            </div>
            {menusLoading ? (
              <div className="flex flex-col gap-3">{[0, 1].map((i) => <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />)}</div>
            ) : menus.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No menu modules yet</p>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'menu' })} className="px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>Create your first menu module</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {menus.map((m) => (
                  <SimpleModuleCard key={m.sheetId} name={m.moduleName} createdAt={m.createdAt} deploymentUrl={m.deploymentUrl} sheetUrl={m.sheetUrl} scriptUrl={m.scriptUrl} typeLabel="Menu" typeBgColor="oklch(0.70 0.18 140 / 0.10)" typeTextColor="oklch(0.70 0.18 140)" onDelete={() => setPendingDeleteMenu(m)} deleting={deletingIds.has(m.sheetId)} />
                ))}
              </div>
            )}
            {pendingDeleteMenu && (
              <GenericDeleteDialog name={pendingDeleteMenu.moduleName} onConfirm={handleConfirmDeleteMenu} onCancel={() => setPendingDeleteMenu(null)} />
            )}
          </div>
        )}

        {/* ── Newsletters tab ── */}
        {activeTab === 'newsletters' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Newsletter / Waitlist</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'newsletter' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <PlusIcon className="w-3 h-3" /> New
              </button>
            </div>
            {newslettersLoading ? (
              <div className="flex flex-col gap-3">{[0, 1].map((i) => <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />)}</div>
            ) : newsletters.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No newsletter modules yet</p>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'newsletter' })} className="px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>Create your first newsletter module</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {newsletters.map((n) => (
                  <SimpleModuleCard key={n.sheetId} name={n.moduleName} createdAt={n.createdAt} deploymentUrl={n.deploymentUrl} sheetUrl={n.sheetUrl} scriptUrl={n.scriptUrl} typeLabel="Newsletter" typeBgColor="oklch(0.68 0.20 220 / 0.10)" typeTextColor="oklch(0.68 0.20 220)" onDelete={() => setPendingDeleteNewsletter(n)} deleting={deletingIds.has(n.sheetId)} />
                ))}
              </div>
            )}
            {pendingDeleteNewsletter && (
              <GenericDeleteDialog name={pendingDeleteNewsletter.moduleName} onConfirm={handleConfirmDeleteNewsletter} onCancel={() => setPendingDeleteNewsletter(null)} />
            )}
          </div>
        )}

        {/* ── Announcements tab ── */}
        {activeTab === 'announcements' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Announcements / Banners</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'announcement' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <PlusIcon className="w-3 h-3" /> New
              </button>
            </div>
            {announcementsLoading ? (
              <div className="flex flex-col gap-3">{[0, 1].map((i) => <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />)}</div>
            ) : announcements.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No announcement modules yet</p>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'announcement' })} className="px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>Create your first announcement module</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {announcements.map((a) => (
                  <SimpleModuleCard key={a.sheetId} name={a.moduleName} createdAt={a.createdAt} deploymentUrl={a.deploymentUrl} sheetUrl={a.sheetUrl} scriptUrl={a.scriptUrl} typeLabel="Announcement" typeBgColor="oklch(0.78 0.18 40 / 0.10)" typeTextColor="oklch(0.78 0.18 40)" onDelete={() => setPendingDeleteAnnouncement(a)} deleting={deletingIds.has(a.sheetId)} />
                ))}
              </div>
            )}
            {pendingDeleteAnnouncement && (
              <GenericDeleteDialog name={pendingDeleteAnnouncement.moduleName} onConfirm={handleConfirmDeleteAnnouncement} onCancel={() => setPendingDeleteAnnouncement(null)} />
            )}
          </div>
        )}

        {/* ── Redirects tab ── */}
        {activeTab === 'redirects' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Redirects</h2>
              <button
                type="button"
                onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'redirects' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent)', color: '#fff' }}
              >
                <PlusIcon className="w-3 h-3" /> New
              </button>
            </div>
            {redirectsLoading ? (
              <div className="flex flex-col gap-3">{[0, 1].map((i) => <div key={i} className="rounded-xl border p-5 h-24 animate-pulse" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }} />)}</div>
            ) : redirectsList.length === 0 ? (
              <div className="rounded-xl border p-10 flex flex-col items-center gap-4 text-center" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No redirects modules yet</p>
                <button type="button" onClick={() => dispatch({ type: 'GO_TO_MODULE_BUILDER', moduleType: 'redirects' })} className="px-5 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'var(--color-accent)', color: '#fff' }}>Create your first redirects module</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {redirectsList.map((r) => (
                  <SimpleModuleCard key={r.sheetId} name={r.moduleName} createdAt={r.createdAt} deploymentUrl={r.deploymentUrl} sheetUrl={r.sheetUrl} scriptUrl={r.scriptUrl} typeLabel="Redirects" typeBgColor="oklch(0.65 0.15 320 / 0.10)" typeTextColor="oklch(0.65 0.15 320)" onDelete={() => setPendingDeleteRedirects(r)} deleting={deletingIds.has(r.sheetId)} />
                ))}
              </div>
            )}
            {pendingDeleteRedirects && (
              <GenericDeleteDialog name={pendingDeleteRedirects.moduleName} onConfirm={handleConfirmDeleteRedirects} onCancel={() => setPendingDeleteRedirects(null)} />
            )}
          </div>
        )}

      </div>

      {/* Form detail modal */}
      {selectedForm && (
        <FormDetailModal form={selectedForm} onClose={() => setSelectedForm(null)} />
      )}

      {/* Content module instructions modal */}
      {selectedModule && (
        <ContentModuleDetailModal module={selectedModule} onClose={() => setSelectedModule(null)} />
      )}

      {/* Asset module instructions modal */}
      {selectedAsset && (
        <AssetDetailModal module={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}

      {/* Site config detail modal */}
      {selectedConfig && (
        <SiteConfigDetailModal module={selectedConfig} onClose={() => setSelectedConfig(null)} />
      )}

      {/* Calendar detail modal */}
      {selectedCalendar && (
        <CalendarDetailModal module={selectedCalendar} onClose={() => setSelectedCalendar(null)} />
      )}

      {/* Gallery detail modal */}
      {selectedGallery && (
        <GalleryDetailModal module={selectedGallery} onClose={() => setSelectedGallery(null)} />
      )}

      {/* AI Skill Export modal */}
      {skillExportOpen && (
        <SkillExportModal
          forms={forms}
          contentModules={modules}
          assetModules={assets}
          siteConfigs={configs}
          calendars={calendars}
          galleries={galleries}
          onClose={() => setSkillExportOpen(false)}
        />
      )}

      {/* Delete form confirmation dialog */}
      {pendingDelete && (
        <DeleteConfirmDialog
          form={pendingDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Delete module confirmation dialog */}
      {pendingDeleteModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Delete &ldquo;{pendingDeleteModule.moduleName}&rdquo;?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This will permanently delete the Google Sheet and its bound Apps Script. All content data will be lost. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirmDeleteModule} className="flex-1 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400" style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
              <button onClick={() => setPendingDeleteModule(null)} className="flex-1 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke permissions confirmation dialog */}
      {revokeConfirmOpen && (
        <RevokeConfirmDialog
          onConfirm={handleConfirmRevoke}
          onCancel={handleCloseRevokeDialog}
          revoking={revoking}
          result={revokeResult}
        />
      )}

      {/* Delete site config confirmation dialog */}
      {pendingDeleteConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Delete &ldquo;{pendingDeleteConfig.moduleName}&rdquo;?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This will permanently delete the Config Sheet and its bound Apps Script. The config endpoint will stop working. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirmDeleteConfig} className="flex-1 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400" style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
              <button onClick={() => setPendingDeleteConfig(null)} className="flex-1 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete calendar confirmation dialog */}
      {pendingDeleteCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Delete &ldquo;{pendingDeleteCalendar.moduleName}&rdquo;?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This will permanently delete the Events Sheet and its bound Apps Script. The calendar endpoint will stop working. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirmDeleteCalendar} className="flex-1 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400" style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
              <button onClick={() => setPendingDeleteCalendar(null)} className="flex-1 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete gallery confirmation dialog */}
      {pendingDeleteGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Delete &ldquo;{pendingDeleteGallery.moduleName}&rdquo;?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This will permanently delete the Gallery Sheet and its bound Apps Script. The gallery endpoint will stop working. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirmDeleteGallery} className="flex-1 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400" style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
              <button onClick={() => setPendingDeleteGallery(null)} className="flex-1 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete asset module confirmation dialog */}
      {pendingDeleteAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                Delete &ldquo;{pendingDeleteAsset.moduleName}&rdquo;?
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This will permanently delete the config spreadsheet and its bound Apps Script. The Drive folder and all files will still exist in your Drive — only the endpoint and config are removed. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleConfirmDeleteAsset} className="flex-1 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-400" style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
              <button onClick={() => setPendingDeleteAsset(null)} className="flex-1 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* In-app content editor overlay */}
      {editingModule && (
        <ContentEditor
          module={editingModule}
          accessToken={accessToken}
          onClose={() => setEditingModule(null)}
          assetModules={assets}
        />
      )}

      {/* Asset manager overlay */}
      {editingAsset && (
        <AssetManager
          module={editingAsset}
          accessToken={accessToken}
          onClose={() => setEditingAsset(null)}
        />
      )}

      {/* Gallery manager overlay */}
      {editingGallery && (
        <GalleryManager
          module={editingGallery}
          accessToken={accessToken}
          onClose={() => setEditingGallery(null)}
        />
      )}

      {/* Calendar manager overlay */}
      {editingCalendar && (
        <CalendarManager
          module={editingCalendar}
          accessToken={accessToken}
          onClose={() => setEditingCalendar(null)}
        />
      )}

      {/* Site config manager overlay */}
      {editingConfig && (
        <SiteConfigManager
          module={editingConfig}
          accessToken={accessToken}
          onClose={() => setEditingConfig(null)}
        />
      )}
    </motion.main>
  );
}
