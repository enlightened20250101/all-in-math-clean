"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { supabase } from "@/lib/supabaseClient";

export default function DirectMessageCreateClient() {
  const router = useRouter();
  const params = useSearchParams();
  const targetId = params.get("user");
  const [status, setStatus] = useState("準備中…");

  useEffect(() => {
    const create = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setStatus("ログインが必要です");
        return;
      }
      if (!targetId || targetId === user.id) {
        setStatus("相手が指定されていません");
        return;
      }
      const dmKey = [user.id, targetId].sort().join("-");
      const dmName = `DM:${dmKey}`;
      const { data: existing } = await supabase
        .from("groups")
        .select("id")
        .eq("name", dmName)
        .maybeSingle();

      let groupId = existing?.id as string | undefined;
      if (!groupId) {
        const { data: created, error } = await supabase
          .from("groups")
          .insert({ name: dmName, owner_id: user.id })
          .select("id")
          .single();
        if (error) {
          setStatus(error.message);
          return;
        }
        groupId = created?.id;
      }

      if (!groupId) {
        setStatus("グループ作成に失敗しました");
        return;
      }

      const { error: memberErr } = await supabase
        .from("group_members")
        .upsert(
          [
            { group_id: groupId, user_id: user.id, role: "member" },
            { group_id: groupId, user_id: targetId, role: "member" },
          ],
          { onConflict: "group_id,user_id" }
        );

      if (memberErr) {
        setStatus(memberErr.message);
        return;
      }

      router.replace(`/groups/${groupId}`);
    };
    create();
  }, [router, targetId]);

  return (
    <AuthGate>
      <div className="max-w-md mx-auto px-4 py-10 text-center text-sm text-gray-600">
        {status}
      </div>
    </AuthGate>
  );
}
