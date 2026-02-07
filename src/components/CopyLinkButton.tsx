'use client';

import { useEffect, useState } from 'react';

type Props = {
  href?: string;
  label?: string;
  className?: string;
};

export default function CopyLinkButton({ href, label = 'リンクをコピー', className = '' }: Props) {
  const [copied, setCopied] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if (!navigator.clipboard?.writeText) setSupported(false);
  }, []);

  const onClick = async () => {
    try {
      const link = href
        ? (href.startsWith('http') ? href : `${window.location.origin}${href}`)
        : window.location.href;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded px-2.5 py-1 text-[10px] sm:text-xs bg-white hover:bg-gray-50 ${className}`}
      aria-live="polite"
    >
      {copied ? 'コピーしました' : label}
    </button>
  );
}
