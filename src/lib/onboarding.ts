import { supabase } from "./supabaseClient";

/** Crea profile, una academy y membership(owner) para el usuario actual. */
export async function finishOnboarding(fullName?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No hay sesión");

  // 1) profile (id = auth.users.id)
  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName ?? user.user_metadata?.full_name ?? null,
  });

  // 2) si ya tiene alguna membership, no crear otra
  const { data: mems } = await supabase
    .from("memberships")
    .select("academy_id")
    .eq("user_id", user.id)
    .limit(1);

  if (mems && mems.length) return mems[0].academy_id;

  // 3) crear academy y membership(owner)
  const academyName = fullName ? `Academia de ${fullName}` : "Mi Academia";
  const { data: academy, error: aerr } = await supabase
    .from("academies")
    .insert({ name: academyName })
    .select()
    .single();
  if (aerr) throw aerr;

  const { error: merr } = await supabase.from("memberships").insert({
    user_id: user.id,
    academy_id: academy.id,
    role: "owner",
  });
  if (merr) throw merr;

  return academy.id;
}
