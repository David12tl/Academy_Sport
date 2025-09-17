import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password: pwd,
    });

    setLoading(false);

    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Cuenta creada. Revisa tu correo si la confirmación está habilitada.");
      // Si en Supabase desactivaste confirmación por email,
      // puedes redirigir directo al dashboard:
      // window.location.href = "/app/dashboard";
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-sm mx-auto">
      <h1 className="text-xl font-bold">Crear cuenta</h1>

      <input
        className="w-full border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="w-full border p-2 rounded"
        type="password"
        placeholder="Contraseña (mín. 6)"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        required
        minLength={6}
      />

      <button
        className="w-full px-3 py-2 rounded bg-black text-white"
        disabled={loading}
        type="submit"
      >
        {loading ? "Creando..." : "Crear cuenta"}
      </button>

      {msg && <p className="text-sm text-blue-600">{msg}</p>}

      <p className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
