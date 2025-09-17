import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) return setMsg(error.message);
    window.location.href = "/app/dashboard"; // cambia la ruta si quieres
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-sm mx-auto">
      <h1 className="text-xl font-bold">Iniciar sesión</h1>
      <input
        className="w-full border p-2 rounded"
        type="email" placeholder="Email"
        value={email} onChange={e => setEmail(e.target.value)} required
      />
      <input
        className="w-full border p-2 rounded"
        type="password" placeholder="Contraseña"
        value={pwd} onChange={e => setPwd(e.target.value)} required
      />
      <button className="w-full px-3 py-2 rounded bg-black text-white" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </button>
      {msg && <p className="text-red-600 text-sm">{msg}</p>}
      <p className="text-sm">
        ¿No tienes cuenta? <a href="/register" className="underline">Crear cuenta</a>
      </p>
    </form>
  );
}
