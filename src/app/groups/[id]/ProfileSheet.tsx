'use client';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (p: { display_name: string; avatar_url: string }) => void; // 楽観更新コールバック
  userId: string;
};

export default function ProfileSheet({ open, onClose, onSaved, userId }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [initialDisplayName, setInitialDisplayName] = useState('');
  const [preview, setPreview] = useState('');
  const [initialAvatarUrl, setInitialAvatarUrl] = useState('');
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const localObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) { console.error(error); return; }

      const dn = data?.display_name || '';
      const av = data?.avatar_url || '';
      setDisplayName(dn);
      setInitialDisplayName(dn);
      setInitialAvatarUrl(av);
      setPreview(av || 'https://placehold.co/96x96?text=%E4%BA%BA');
      setPendingAvatarUrl(null);
    })();

    return () => {
      if (localObjectUrlRef.current) URL.revokeObjectURL(localObjectUrlRef.current);
    };
  }, [open, userId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (localObjectUrlRef.current) URL.revokeObjectURL(localObjectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    localObjectUrlRef.current = localUrl;
    setPreview(localUrl);

    try {
      setUploading(true);
      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type || undefined });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub.publicUrl;
      setPreview(publicUrl);
      setPendingAvatarUrl(publicUrl);
    } catch (e: any) {
      console.error(e);
      setToast({ message: e?.message || 'アップロードに失敗しました', type: 'error' });
      setPreview(initialAvatarUrl || 'https://placehold.co/96x96?text=%E4%BA%BA');
      setPendingAvatarUrl(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const save = async () => {
    const nextDisplay = displayName.trim();
    if (!nextDisplay && !confirm('表示名が空です。このまま保存しますか？')) return;
    setSaving(true);
    try {
      const nextAvatar = pendingAvatarUrl ?? initialAvatarUrl;
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, display_name: nextDisplay, avatar_url: nextAvatar })
        .select('display_name, avatar_url')
        .single();
      if (error) throw error;

      // 楽観更新：親に伝える（チャットUI即反映）
      onSaved({ display_name: data.display_name ?? '', avatar_url: data.avatar_url ?? '' });

      // 初期値更新
      setInitialDisplayName(data.display_name ?? '');
      setInitialAvatarUrl(data.avatar_url ?? '');
      setPendingAvatarUrl(null);
      setPreview((data.avatar_url ?? '') || 'https://placehold.co/96x96?text=%E4%BA%BA');

      onClose();
    } catch (e: any) {
      console.error(e);
      setToast({ message: e?.message || '保存に失敗しました', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end md:items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-t-2xl md:rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">プロフィール編集</h2>
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
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview || 'https://placehold.co/96x96?text=%E4%BA%BA'}
            alt=""
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/96x96?text=%E4%BA%BA';
            }}
            className="w-20 h-20 rounded-full object-cover border"
          />
          <label className="px-3 py-2 border rounded cursor-pointer text-sm inline-block">
            画像を選択
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChangeFile} disabled={uploading} />
          </label>
        </div>

        <label className="block text-sm">表示名</label>
        <input
          className="border rounded p-2 w-full"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="例）山田 太郎"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">キャンセル</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 border rounded bg-blue-600 text-white disabled:opacity-50">
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
