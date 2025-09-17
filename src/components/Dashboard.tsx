import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { finishOnboarding } from "../lib/onboarding";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth"; return; }
      setUserEmail(user.email ?? null);

      // Si viene de OAuth y no tiene datos, crea profile/academy/membership
      try { await finishOnboarding(user.user_metadata?.full_name); } catch {}
      setReady(true);
    })();
  }, []);

  if (!ready) return <p>Cargando…</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p>Sesión: {userEmail}</p>
      <button
        className="px-3 py-2 rounded border"
        onClick={async () => { await supabase.auth.signOut(); window.location.href = "/auth"; }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
