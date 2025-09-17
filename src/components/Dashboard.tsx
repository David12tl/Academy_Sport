import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { window.location.href = "/login"; return; }
      setEmail(data.user.email ?? null);
    });
  }, []);

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <p>Sesión: {email ?? "Cargando…"}</p>
      <button
        className="px-3 py-2 rounded border"
        onClick={async () => { await supabase.auth.signOut(); window.location.href = "/login"; }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
