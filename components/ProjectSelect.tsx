'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useApp } from '@/context/AppContext';
import { listProjects } from '@/lib/myForms';
import { provisionProject } from '@/lib/projectProvision';
import { revokeToken } from '@/lib/auth';
import UserAvatar from '@/components/UserAvatar';
import type { ProjectSummary } from '@/types';

// ─── Icons ────────────────────────────────────────────────────────────────────

function FolderIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 6.5A2.5 2.5 0 014.5 4h2.836a2.5 2.5 0 011.767.732l.914.914A2.5 2.5 0 0011.784 6.5H15.5A2.5 2.5 0 0118 9v5.5A2.5 2.5 0 0115.5 17h-11A2.5 2.5 0 012 14.5v-8z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onSelect,
}: {
  project: ProjectSummary;
  onSelect: (p: ProjectSummary) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-5 flex items-center justify-between gap-4 cursor-pointer transition-colors"
      style={{
        background: hovered ? 'var(--color-surface-2)' : 'var(--color-surface)',
        borderColor: hovered ? 'var(--color-accent-border)' : 'var(--color-border)',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(project); }}
      aria-label={`Open project ${project.projectName}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: hovered ? 'var(--color-accent-subtle)' : 'var(--color-surface)',
            border: `1px solid ${hovered ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
            transition: 'background 0.15s, border-color 0.15s',
          }}
        >
          <FolderIcon className="w-5 h-5" style={{ color: hovered ? 'var(--color-accent)' : 'var(--color-muted)' } as React.CSSProperties} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
            {project.projectName}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            Created {formatDate(project.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {project.deploymentUrl && (
          <a
            href={project.deploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg border transition-colors"
            style={{
              background: 'transparent',
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
            title="Open project API"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-accent-border)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-muted)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
            }}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </a>
        )}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: hovered ? 'var(--color-accent)' : 'var(--color-muted)' }}
        >
          <ArrowRightIcon className="w-4 h-4" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Create project form ──────────────────────────────────────────────────────

function CreateProjectForm({
  onCancel,
  onCreating,
}: {
  onCancel: () => void;
  onCreating: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-xl border p-5 flex flex-col gap-4"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-accent-border)' }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>New project</p>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: 'var(--color-muted)' }} htmlFor="project-name">
          Project name
        </label>
        <input
          ref={inputRef}
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onCreating(name.trim()); if (e.key === 'Escape') onCancel(); }}
          placeholder="My Website"
          maxLength={60}
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          style={{
            background: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
          }}
        />
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          Creates a Google Sheet + Apps Script that powers this project's API.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors"
          style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; }}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => { if (name.trim()) onCreating(name.trim()); }}
          className="flex-1 py-2 rounded-lg text-sm font-semibold transition-opacity"
          style={{
            background: 'var(--color-accent)',
            color: '#000',
            opacity: name.trim() ? 1 : 0.4,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Create project
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectSelect() {
  const { state, dispatch } = useApp();
  const { auth } = state;
  const user = auth.user!;
  const accessToken = auth.accessToken!;

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [revokeResult, setRevokeResult] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    listProjects(accessToken, controller.signal)
      .then((ps) => { if (!controller.signal.aborted) { setProjects(ps); setLoading(false); } })
      .catch((err) => { if (!controller.signal.aborted) { setError('Could not load projects. Please try again.'); setLoading(false); } void err; });
    return () => { controller.abort(); };
  }, [accessToken]);

  async function handleCreate(name: string) {
    setShowCreate(false);
    dispatch({ type: 'SET_PROJECT_CREATE_NAME', payload: name });
    dispatch({ type: 'START_PROJECT_PROVISIONING' });

    try {
      const project = await provisionProject(
        accessToken,
        name,
        (stepId, status, error) => dispatch({ type: 'UPDATE_STEP', payload: { id: stepId, status, error } }),
      );
      dispatch({ type: 'SET_PROJECT_RESULT', payload: project });
    } catch (err) {
      dispatch({ type: 'PROJECT_PROVISION_ERROR', payload: (err as Error).message });
    }
  }

  async function handleRevoke() {
    try {
      await revokeToken(accessToken);
      setRevokeResult('success');
      setTimeout(() => dispatch({ type: 'SIGN_OUT' }), 1200);
    } catch {
      setRevokeResult('error');
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

        {/* Header */}
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
              onClick={() => { setRevokeResult('idle'); setRevokeConfirmOpen(true); }}
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
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
              className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Error from previous provisioning attempt */}
        {state.projectProvisionError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
          >
            {state.projectProvisionError}
          </div>
        )}

        {/* Projects section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
                Your projects
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Select a project to manage its modules and APIs.
              </p>
            </div>

            {!showCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                style={{ background: 'var(--color-accent-subtle)', borderColor: 'var(--color-accent-border)', color: 'var(--color-accent)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-subtle)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
                }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                New project
              </button>
            )}
          </div>

          <AnimatePresence>
            {showCreate && (
              <CreateProjectForm
                onCancel={() => setShowCreate(false)}
                onCreating={handleCreate}
              />
            )}
          </AnimatePresence>

          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border p-5 h-[72px] animate-pulse"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                />
              ))}
            </div>
          )}

          {error && !loading && (
            <div
              className="rounded-xl border px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
            >
              {error}
            </div>
          )}

          {!loading && !error && projects.length === 0 && !showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border p-8 flex flex-col items-center gap-4 text-center"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', borderStyle: 'dashed' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              >
                <FolderIcon className="w-6 h-6" style={{ color: 'var(--color-muted)' } as React.CSSProperties} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>No projects yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                  Create your first project to start building your site's backend APIs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--color-accent)', color: '#000' }}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Create first project
              </button>
            </motion.div>
          )}

          {!loading && projects.length > 0 && (
            <div className="flex flex-col gap-3">
              {projects.map((p) => (
                <ProjectCard
                  key={p.sheetId}
                  project={p}
                  onSelect={(proj) => dispatch({ type: 'SELECT_PROJECT', payload: proj })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Revoke confirm modal */}
      {revokeConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border p-6 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Revoke Google permissions?</p>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                This signs you out and removes Sheetspin' access token from Google's servers.
              </p>
            </div>

            {revokeResult === 'success' && (
              <p className="text-xs" style={{ color: 'var(--color-accent)' }}>Permissions revoked — signing you out…</p>
            )}
            {revokeResult === 'error' && (
              <p className="text-xs" style={{ color: '#ef4444' }}>Revoke failed. You can remove access manually in your Google Account settings.</p>
            )}

            {revokeResult === 'idle' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRevokeConfirmOpen(false)}
                  className={clsx('flex-1 py-2 rounded-lg border text-sm font-medium')}
                  style={{ background: 'transparent', borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevoke}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  Revoke
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.main>
  );
}
