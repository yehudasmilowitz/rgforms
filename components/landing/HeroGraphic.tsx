'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { Mail, Check, Send, Inbox, Sheet } from 'lucide-react';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STAGES = [
  { label: 'Filling out the form' },
  { label: 'Saved to your Google Sheet' },
  { label: 'Delivered to your inbox' },
] as const;

const DWELL = 6000; // ms a scene stays flat before flipping
const FLIP = 0.5; // s per half-flip

/**
 * Fully custom animated 3D hero graphic — no image asset.
 * One card flips through a three-act story: a contact form fills in and is sent,
 * the card flips to a Google Sheet where the row populates green, then flips again
 * to an inbox where the email notification arrives. Loops. Parallax-tilts to the cursor.
 */
export default function HeroGraphic() {
  const ref = useRef<HTMLDivElement>(null);
  const flip = useAnimationControls();
  const [scene, setScene] = useState(0);

  // Cursor parallax tilt (kept subtle so it never fights the flip).
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 110, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-12, 4]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [9, -2]), spring);

  function handleMove(e: React.PointerEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function handleLeave() {
    px.set(0);
    py.set(0);
  }

  // The flip loop: dwell → flip out to edge → swap scene while hidden → flip in.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        while (active) {
          await wait(DWELL);
          if (!active) break;
          await flip.start({ rotateY: 90, transition: { duration: FLIP, ease: 'easeIn' } });
          if (!active) break;
          setScene((s) => (s + 1) % STAGES.length);
          flip.set({ rotateY: -90 }); // jump across the edge — invisible at 0 width
          await flip.start({ rotateY: 0, transition: { duration: FLIP, ease: 'easeOut' } });
        }
      } catch {
        /* unmounted mid-flip — ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, [flip]);

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative w-full aspect-[5/4] select-none"
      style={{ perspective: '1200px' }}
      aria-hidden="true"
    >
      {/* brand glow seated behind the card */}
      <div
        className="absolute inset-[10%] rounded-[40px] blur-2xl"
        style={{
          background:
            'radial-gradient(60% 60% at 35% 30%, var(--color-accent-glow), transparent 70%), radial-gradient(55% 55% at 80% 80%, oklch(0.66 0.24 350 / 0.32), transparent 70%)',
          animation: 'glow-pulse 6s ease-in-out infinite',
        }}
      />

      <motion.div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}>
        {/* gentle bob */}
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* ── The flipping card ─────────────────────────────── */}
          <motion.div
            className="absolute left-[12%] right-[12%] top-[13%] bottom-[13%] rounded-2xl overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
            animate={flip}
          >
            {/* content keyed by scene → remounts so its entry animations replay */}
            <div key={scene} className="absolute inset-0">
              {scene === 0 && <FormScene />}
              {scene === 1 && <SheetScene />}
              {scene === 2 && <InboxScene />}
            </div>
          </motion.div>

          {/* ── Stage label pill ──────────────────────────────── */}
          <div className="absolute left-0 right-0 bottom-[2%] flex justify-center" style={{ transform: 'translateZ(60px)' }}>
            <motion.span
              key={scene}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: FLIP }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                color: 'var(--color-accent-ink)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
              {STAGES[scene].label}
            </motion.span>
          </div>

          {/* ── Floating decorative orbs ──────────────────────── */}
          <span
            className="absolute rounded-full animate-float-slow"
            style={{ top: '4%', left: '8%', width: 20, height: 20, transform: 'translateZ(130px)', background: 'linear-gradient(135deg, var(--grad-from), var(--grad-via))', boxShadow: 'var(--shadow-md)' }}
          />
          <span
            className="absolute rounded-full animate-float"
            style={{ top: '16%', right: '5%', width: 13, height: 13, transform: 'translateZ(120px)', background: 'var(--color-coral)' }}
          />
          <span
            className="absolute rounded-full animate-float-slow"
            style={{ bottom: '6%', right: '14%', width: 9, height: 9, transform: 'translateZ(140px)', background: 'var(--grad-to)' }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────── Scenes ─────────────────────────── */

function CardHeader({ icon: Icon, title, accent }: { icon: typeof Mail; title: string; accent?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5"
      style={
        accent
          ? { background: 'linear-gradient(100deg, var(--grad-from), var(--grad-via) 60%, var(--grad-to))' }
          : { borderBottom: '1px solid var(--color-border)' }
      }
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-lg"
        style={
          accent
            ? { background: 'rgba(255,255,255,0.22)', color: '#fff' }
            : { background: 'var(--color-accent-subtle)', color: 'var(--color-accent-ink)' }
        }
      >
        <Icon size={13} />
      </span>
      <span
        className="text-[11px] font-extrabold"
        style={{ color: accent ? '#fff' : 'var(--color-heading)', fontFamily: 'var(--font-display)' }}
      >
        {title}
      </span>
    </div>
  );
}

function FormScene() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <CardHeader icon={Mail} title="Contact us" />
      <div className="flex-1 px-4 py-3 flex flex-col">
        {[0, 1, 2].map((f) => (
          <div key={f} className="mb-2.5">
            <span className="block w-2/5 h-1.5 rounded-full mb-1.5" style={{ background: 'var(--color-border-strong)' }} />
            <div className="relative h-7 rounded-lg overflow-hidden" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <motion.span
                className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 rounded-full"
                style={{ background: 'var(--color-accent-border)' }}
                initial={{ width: 0 }}
                animate={{ width: ['0%', '64%'] }}
                transition={{ duration: 0.45, delay: FLIP + 0.15 + f * 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
        {/* Send button with a click press near the end of the dwell */}
        <motion.div
          className="mt-auto flex items-center justify-center gap-1.5 h-9 rounded-lg text-white text-[11px] font-bold"
          style={{
            background: 'linear-gradient(100deg, var(--grad-from), var(--grad-via) 55%, var(--grad-to))',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 6px 18px oklch(0.55 0.22 295 / 0.35)',
          }}
          animate={{ scale: [1, 1, 0.9, 1.02, 1] }}
          transition={{ duration: 2.0, times: [0, 0.74, 0.82, 0.9, 1], ease: 'easeOut' }}
        >
          <Send size={12} /> Send
        </motion.div>
      </div>
    </div>
  );
}

function SheetScene() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <CardHeader icon={Sheet} title="Sheet1" accent />
      <div className="flex-1 p-3 grid content-start gap-1.5">
        {[0, 1, 2, 3].map((row) => {
          const isHeader = row === 0;
          const isNew = row === 3;
          return (
            <div key={row} className="relative grid grid-cols-[1.4fr_1fr_0.8fr] gap-1.5">
              {[0, 1, 2].map((col) => (
                <span
                  key={col}
                  className="h-4 rounded-[4px]"
                  style={{
                    background: isHeader ? 'var(--color-accent-subtle)' : 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              ))}
              {/* new row lands, then flashes green with a check */}
              {isNew && (
                <motion.div
                  className="absolute inset-0 -m-0.5 rounded-md flex items-center justify-end pr-1.5"
                  style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', transformOrigin: 'left' }}
                  initial={{ opacity: 0, scaleX: 0.6 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: FLIP + 0.35, ease: 'easeOut' }}
                >
                  <motion.span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full"
                    style={{ background: 'var(--color-success)', color: '#fff' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: FLIP + 0.7, ease: 'backOut' }}
                  >
                    <Check size={10} strokeWidth={3} />
                  </motion.span>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InboxScene() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <CardHeader icon={Inbox} title="Inbox" />
      <div className="flex-1 p-3 flex flex-col gap-2">
        {/* new email arrives at the top */}
        <motion.div
          className="flex items-center gap-2.5 rounded-xl p-2.5"
          style={{ background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent-border)' }}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: FLIP + 0.25, ease: 'backOut' }}
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--grad-from), var(--grad-to))', color: '#fff' }}
          >
            <Mail size={15} />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block w-3/4 h-1.5 rounded-full mb-1.5" style={{ background: 'var(--color-heading)', opacity: 0.82 }} />
            <span className="block w-1/2 h-1.5 rounded-full" style={{ background: 'var(--color-border-strong)' }} />
          </div>
          <motion.span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: 'var(--color-success)' }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: FLIP + 0.6 }}
          />
        </motion.div>
        {/* older, settled emails */}
        {[0, 1].map((m) => (
          <div key={m} className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <span className="w-8 h-8 rounded-lg shrink-0" style={{ background: 'var(--color-border)' }} />
            <div className="min-w-0 flex-1">
              <span className="block w-2/3 h-1.5 rounded-full mb-1.5" style={{ background: 'var(--color-border-strong)' }} />
              <span className="block w-2/5 h-1.5 rounded-full" style={{ background: 'var(--color-border)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
