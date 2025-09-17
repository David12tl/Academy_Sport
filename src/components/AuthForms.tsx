import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { finishOnboarding } from "../lib/onboarding";

type View = "login" | "register";

export default function AuthForms() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [fullName, setFullName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Si hay sesión, redirige al dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.href = "/app/dashboard";
    });
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) return setMsg(error.message);
    window.location.href = "/app/dashboard";
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: { data: { full_name: fullName } }
    });
    if (error) { setLoading(false); return setMsg(error.message); }

    // Si el proyecto requiere verificación por email, puede no haber sesión inmediata:
    // intentamos completar onboarding si ya hay sesión; si no, avisamos al usuario.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      try {
        await finishOnboarding(fullName);
        window.location.href = "/app/dashboard";
      } catch (e: any) {
        setMsg(e?.message ?? "Error creando datos iniciales.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setMsg("Revisa tu correo para confirmar la cuenta y luego inicia sesión.");
    }
  };

  const loginWithGoogle = async () => {
    setMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) setMsg(error.message);
    // Nota: al volver del OAuth, puedes correr finishOnboarding en /app/dashboard
    // (ver abajo en Dashboard) para completar profile/academy si falta.
  };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="flex gap-2 justify-center text-sm">
        <button
          className={`px-3 py-1 rounded ${view === "login" ? "bg-black text-white" : "border"}`}
          onClick={() => setView("login")}
          type="button"
        >Iniciar sesión</button>
        <button
          className={`px-3 py-1 rounded ${view === "register" ? "bg-black text-white" : "border"}`}
          onClick={() => setView("register")}
          type="button"
        >Crear cuenta</button>
      </div>

      {view === "login" ? (
        <form onSubmit={login} className="space-y-3">
          <input className="w-full border p-2 rounded" type="email" placeholder="Email"
                 value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full border p-2 rounded" type="password" placeholder="Contraseña"
                 value={pwd} onChange={e => setPwd(e.target.value)} required />
          <button disabled={loading} className="w-full px-3 py-2 rounded bg-black text-white" type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" className="w-full px-3 py-2 rounded border" onClick={loginWithGoogle}>
            Continuar con Google
          </button>
          {msg && <p className="text-red-600 text-sm">{msg}</p>}
        </form>
      ) : (
        <form onSubmit={register} className="space-y-3">
          <input className="w-full border p-2 rounded" placeholder="Nombre completo"
                 value={fullName} onChange={e => setFullName(e.target.value)} />
          <input className="w-full border p-2 rounded" type="email" placeholder="Email"
                 value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full border p-2 rounded" type="password" placeholder="Contraseña (mín. 6)"
                 value={pwd} onChange={e => setPwd(e.target.value)} required minLength={6} />
          <button disabled={loading} className="w-full px-3 py-2 rounded bg-black text-white" type="submit">
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
          <button type="button" className="w-full px-3 py-2 rounded border" onClick={loginWithGoogle}>
            Registrarme con Google
          </button>
          {msg && <p className="text-red-600 text-sm">{msg}</p>}
        </form>
      )}
    </div>
  );
}
