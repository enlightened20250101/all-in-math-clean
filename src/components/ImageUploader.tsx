'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UploadedImage = {
  url: string;   // public URL
  path: string;  // bucket path
};

export default function ImageUploader({
  value,
  onChange,
  maxImages = 4,
  bucket = 'post-images'
}: {
  value: UploadedImage[];
  onChange: (imgs: UploadedImage[]) => void;
  maxImages?: number;
  bucket?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const remaining = Math.max(0, maxImages - value.length);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onPick = () => inputRef.current?.click();

  const compressIfNeeded = async (file: File): Promise<Blob> => {
    // 2MB以下ならそのまま
    const LIMIT = 2 * 1024 * 1024;
    if (file.size <= LIMIT) return file;

    // 画像以外は拒否
    if (!file.type.startsWith('image/')) return file;

    // 画像読み込み
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    ctx.drawImage(bitmap, 0, 0);

    // 品質を下げつつ2MB以下になるまで試行（WebP/JPEG）
    let quality = 0.92;
    let blob: Blob | null = null;
    for (let i = 0; i < 6; i++) {
      blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob(
          (b) => resolve(b!),
          'image/webp', // 互換と圧縮率のバランスで WebP
          quality
        )
      );
      if (blob.size <= LIMIT) break;
      quality -= 0.15; // 段階的に圧縮
      if (quality < 0.35) break;
    }
    return blob || file;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setToast({ message: 'ログインが必要です', type: 'error' });
      return;
    }
    setBusy(true);
    try {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');

      const selected = Array.from(files).slice(0, remaining);
      const next: UploadedImage[] = [];

      for (const f of selected) {
        const blob = await compressIfNeeded(f);
        const uid = user.id;
        const key = crypto.randomUUID();
        const path = `${uid}/${y}${m}${d}/${key}.webp`;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, blob, {
            cacheControl: '31536000',
            upsert: false,
            contentType: 'image/webp'
          });
        if (error) {
          console.error(error);
          setToast({ message: `画像アップロードに失敗しました: ${error.message}`, type: 'error' });
          continue;
        }

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
        next.push({ url: pub.publicUrl, path });
      }

      if (next.length > 0) onChange([...value, ...next].slice(0, maxImages));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (idx: number) => {
    const copy = [...value];
    copy.splice(idx, 1);
    onChange(copy);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="underline disabled:opacity-50"
          onClick={onPick}
          disabled={busy || remaining <= 0}
        >
          画像を選ぶ（残り {remaining} / {maxImages}）
        </button>
        {busy && <span className="text-sm text-gray-500">アップロード中…</span>}
      </div>
      {toast ? (
        <div
          className={`rounded-md border px-2 py-1 text-xs ${
            toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {value.map((img, i) => (
            <div key={img.path} className="border rounded p-1 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-28 object-cover rounded" />
              <button
                type="button"
                className="absolute top-1 right-1 text-xs bg-white/90 border rounded px-1"
                onClick={() => removeAt(i)}
                aria-label="remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">
        * 画像は最大 {maxImages} 枚。2MBを超える場合、自動的に圧縮（WebP）します。
      </p>
    </div>
  );
}
