'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

function ProfileSettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 戻り先（例：/groups /groups/<uuid> など）。無ければ一覧に戻す
  const nextPath = searchParams.get('next') || '/groups';

  const [userId, setUserId] = useState<string>('');

  const [displayName, setDisplayName] = useState('');
  const [initialDisplayName, setInitialDisplayName] = useState('');
  const [grade, setGrade] = useState('');
  const [initialGrade, setInitialGrade] = useState('');
  const [learningStage, setLearningStage] = useState('');
  const [initialLearningStage, setInitialLearningStage] = useState('');
  const [targetLevel, setTargetLevel] = useState('');
  const [initialTargetLevel, setInitialTargetLevel] = useState('');
  const [userRank, setUserRank] = useState('');
  const [initialUserRank, setInitialUserRank] = useState('');

  const [preview, setPreview] = useState('');                       // 表示用プレビュー
  const [initialAvatarUrl, setInitialAvatarUrl] = useState('');     // DB 保存済み URL
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null); // 未保存の新 URL

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const localObjectUrlRef = useRef<string | null>(null);

  // 変更フラグ
  const isDirty = useMemo(() => {
    const avatarChanged = pendingAvatarUrl !== null && pendingAvatarUrl !== initialAvatarUrl;
    const nameChanged = displayName.trim() !== initialDisplayName.trim();
    const gradeChanged = grade !== initialGrade;
    const stageChanged = learningStage !== initialLearningStage;
    const targetChanged = targetLevel !== initialTargetLevel;
    const rankChanged = userRank !== initialUserRank;
    return avatarChanged || nameChanged || gradeChanged || stageChanged || targetChanged || rankChanged;
  }, [
    pendingAvatarUrl,
    initialAvatarUrl,
    displayName,
    initialDisplayName,
    grade,
    initialGrade,
    learningStage,
    initialLearningStage,
    targetLevel,
    initialTargetLevel,
    userRank,
    initialUserRank,
  ]);

  // 初期ロード（upsert しない！）
  useEffect(() => {
    (async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        console.error('auth.getUser error', userErr);
        return;
      }
      if (!user) return;
      setUserId(user.id);

      let data;
      const { data: first, error } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, grade, learning_stage, target_level, user_rank')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        const fallback = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        if (fallback.error) {
          console.error('profiles fetch error', fallback.error);
          return;
        }
        data = fallback.data ?? null;
      } else {
        data = first ?? null;
      }

      const dn = data?.display_name || '';
      const av = data?.avatar_url || '';
      const gr = (data as any)?.grade || '';
      const stage = (data as any)?.learning_stage || '';
      const target = (data as any)?.target_level || '';
      const rank = (data as any)?.user_rank || '';

      setDisplayName(dn);
      setInitialDisplayName(dn);
      setGrade(gr);
      setInitialGrade(gr);
      setLearningStage(stage);
      setInitialLearningStage(stage);
      setTargetLevel(target);
      setInitialTargetLevel(target);
      setUserRank(rank);
      setInitialUserRank(rank);

      setInitialAvatarUrl(av);
      setPreview(av || 'https://placehold.co/96x96?text=%E4%BA%BA');

      setPendingAvatarUrl(null); // 未保存なし
    })();

    return () => {
      if (localObjectUrlRef.current) URL.revokeObjectURL(localObjectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ファイル選択 → Storage へアップロード（DB は触らない）
  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // ローカル即時プレビュー
    if (localObjectUrlRef.current) URL.revokeObjectURL(localObjectUrlRef.current);
    const localUrl = URL.createObjectURL(file);
    localObjectUrlRef.current = localUrl;
    setPreview(localUrl);

    try {
      setUploading(true);

      const ext = (file.name.split('.').pop() || 'png').toLowerCase();
      const path = `${userId}/${Date.now()}.${ext}`;

      // avatars バケットにアップロード
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type || undefined });
      if (upErr) throw upErr;

      // 公開 URL 取得（この時点では DB に保存しない）
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      // 本番 URL に差し替え、未保存フラグに保持
      setPreview(publicUrl);
      setPendingAvatarUrl(publicUrl);
    } catch (e: any) {
      console.error('avatar upload error', e);
      setToast({ message: e?.message || 'アップロードに失敗しました', type: 'error' });
      setPreview(initialAvatarUrl || 'https://placehold.co/96x96?text=%E4%BA%BA');
      setPendingAvatarUrl(null);
    } finally {
      setUploading(false);
      e.currentTarget.value = '';
    }
  };

  const save = async () => {
    if (!userId) return;
  
    const nextDisplay = displayName.trim();
    if (!nextDisplay && !confirm('表示名が空です。このまま保存しますか？')) return;
  
    setSaving(true);
    try {
      const nextAvatar = pendingAvatarUrl ?? initialAvatarUrl;

      const { data: fresh, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: nextDisplay,
          avatar_url: nextAvatar,
          grade: grade || null,
          learning_stage: learningStage || null,
          target_level: targetLevel || null,
          user_rank: userRank || null,
        })
        .select('display_name, avatar_url, grade, learning_stage, target_level, user_rank')
        .maybeSingle();

      if (error) {
        console.error('profiles save error', error);
        throw error;
      }

      setInitialDisplayName(fresh?.display_name ?? '');
      setInitialAvatarUrl(fresh?.avatar_url ?? '');
      setInitialGrade(fresh?.grade ?? '');
      setInitialLearningStage(fresh?.learning_stage ?? '');
      setInitialTargetLevel(fresh?.target_level ?? '');
      setInitialUserRank(fresh?.user_rank ?? '');
      setPendingAvatarUrl(null);
      setPreview((fresh?.avatar_url ?? '') || 'https://placehold.co/96x96?text=%E4%BA%BA');
  
      // /groups 側へ更新通知（あなたの既存実装と整合）
      localStorage.setItem('profile:updated', String(Date.now()));
  
      // 戻り先へ push（updatedで再fetch）
      // 例: /groups に戻す
      const ts = Date.now();
      const sep = nextPath.includes('?') ? '&' : '?';
      router.push(`${nextPath}${sep}updated=${ts}`);
  
      setToast({ message: '保存しました', type: 'success' });
    } catch (e: any) {
      console.error('profiles save error', e);
      setToast({ message: e?.message || '保存に失敗しました', type: 'error' });
    } finally {
      setSaving(false);
    }
  };  

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">プロフィール設定</h1>
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

      {/* アイコン + アップロード */}
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview || 'https://placehold.co/96x96?text=%E4%BA%BA'}
          alt=""
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/96x96?text=%E4%BA%BA';
          }}
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div className="space-y-1">
          <label className="px-3 py-2 border rounded cursor-pointer text-sm inline-block">
            画像を選択
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onChangeFile}
              disabled={uploading}
            />
          </label>
          {pendingAvatarUrl && (
            <div className="text-xs text-orange-600">
              ※ 画像はアップロード済み。保存でプロフィールに反映されます
            </div>
          )}
        </div>
      </div>

      {/* 表示名 */}
      <label className="block text-sm">表示名</label>
      <input
        className="border rounded p-2 w-full"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="例）山田 太郎"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-sm">学年</label>
          <select
            className="border rounded p-2 w-full"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="">未設定</option>
            <option value="中学">中学</option>
            <option value="高1">高1</option>
            <option value="高2">高2</option>
            <option value="高3">高3</option>
            <option value="既卒">既卒</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm">学習済み範囲</label>
          <select
            className="border rounded p-2 w-full"
            value={learningStage}
            onChange={(e) => setLearningStage(e.target.value)}
          >
            <option value="">未設定</option>
            <option value="基礎">基礎</option>
            <option value="標準">標準</option>
            <option value="応用">応用</option>
            <option value="発展">発展</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm">志望レベル</label>
          <select
            className="border rounded p-2 w-full"
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
          >
            <option value="">未設定</option>
            <option value="共通テスト重視">共通テスト重視</option>
            <option value="中堅大">中堅大</option>
            <option value="難関大">難関大</option>
            <option value="最難関">最難関</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm">ユーザーランク</label>
          <select
            className="border rounded p-2 w-full"
            value={userRank}
            onChange={(e) => setUserRank(e.target.value)}
          >
            <option value="">未設定</option>
            <option value="ブロンズ">ブロンズ</option>
            <option value="シルバー">シルバー</option>
            <option value="ゴールド">ゴールド</option>
            <option value="プラチナ">プラチナ</option>
          </select>
        </div>
      </div>

      {/* ボタン群 */}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !isDirty}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存'}
        </button>
        <button
          onClick={() => {
            const ts = Date.now();
            const sep = nextPath.includes('?') ? '&' : '?';
            router.push(`${nextPath}${sep}updated=${ts}`);
          }}
          className="px-4 py-2 border rounded"
        >
          戻る
        </button>
      </div>

      {!isDirty ? (
        <div className="text-xs text-gray-500">現在のプロフィールは保存済みです。</div>
      ) : (
        <div className="text-xs text-orange-600">未保存の変更があります。</div>
      )}
    </div>
  );
}

export default function ProfileSettings() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
      <ProfileSettingsInner />
    </Suspense>
  );
}
