'use client';

import { useState } from 'react';

interface UserAvatarProps {
  name: string;
  picture: string;
  size?: number;
  className?: string;
}

// Shows the Google profile picture; falls back to an initials circle
// if the image fails to load (e.g. blocked by Brave Shields).
export default function UserAvatar({ name, picture, size = 32, className = '' }: UserAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const baseClass = `rounded-full shrink-0 border border-[var(--color-border)] ${className}`;

  if (imgFailed) {
    return (
      <div
        className={`${baseClass} flex items-center justify-center text-xs font-semibold select-none`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          background: 'var(--color-accent)',
          color: 'oklch(0.08 0.01 260)',
          fontSize: size * 0.38,
        }}
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={picture}
      alt={name}
      width={size}
      height={size}
      className={baseClass}
      onError={() => setImgFailed(true)}
    />
  );
}
