import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield, LogIn } from "lucide-react";
import "./login.module.css";

type Captcha = { a: number; b: number; op: "+" | "-" };

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
// Tu backend expone POST /login
const LOGIN_PATH = "/login";

const now = () => Date.now();

/** Bloqueo escalonado: 15s → 30s → 60s → 5min */
function nextLockMs(fails: number) {
  if (fails <= 0) return 0;
  if (fails === 1) return 15_000;
  if (fails === 2) return 30_000;
  if (fails === 3) return 60_000;
  return 5 * 60_000;
}

export default function Login() {
  const navigate = useNavigate();

  // Form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // UI
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  // Intentos / bloqueo
  const [failCount, setFailCount] = useState<number>(
    () => Number(localStorage.getItem("login_fail_count")) || 0
  );
  const [lockUntil, setLockUntil] = useState<number>(
    () => Number(localStorage.getItem("login_lock_until")) || 0
  );
  const locked = Math.max(0, lockUntil - now()) > 0;

  // Captcha (suma o resta)
  const [captcha, setCaptcha] = useState<Captcha>(() => ({
    a: Math.floor(1 + Math.random() * 9),
    b: Math.floor(1 + Math.random() * 9),
    op: Math.random() < 0.5 ? "+" : "-",
  }));
  const [captchaInput, setCaptchaInput] = useState("");

  const emailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );

  // reloj del bloqueo (mensaje en UI)
  useEffect(() => {
    if (!locked) return;
    const id = setInterval(() => {
      if (now() >= lockUntil) {
        setLockUntil(0);
        localStorage.removeItem("login_lock_until");
        setMsg("");
      } else {
        const s = Math.ceil((lockUntil - now()) / 1000);
        setMsg(`🔒 Espera ${s}s antes de reintentar.`);
      }
    }, 500);
    return () => clearInterval(id);
  }, [locked, lockUntil]);

  function resetCaptcha() {
    setCaptcha({
      a: Math.floor(1 + Math.random() * 9),
      b: Math.floor(1 + Math.random() * 9),
      op: Math.random() < 0.5 ? "+" : "-",
    });
    setCaptchaInput("");
  }

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();
    if (locked) return;

    if (!email || !password) {
      setMsg("⚠️ Completa todos los campos.");
      return;
    }
    if (!emailValid) {
      setMsg("⚠️ Ingresa un correo válido.");
      return;
    }

    // Calcula el resultado del captcha (puede ser negativo)
    const expected =
      captcha.op === "+" ? captcha.a + captcha.b : captcha.a - captcha.b;

    if (Number(captchaInput) !== expected) {
      setMsg("❌ Captcha incorrecto.");
      resetCaptcha();
      return;
    }

    try {
      setBusy(true);
      setMsg("");

      const resp = await fetch(`${API_URL}${LOGIN_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await resp.json().catch(() => ({} as any));

      if (!resp.ok) {
        // fallo → suma intento y calcula bloqueo
        const newFails = failCount + 1;
        setFailCount(newFails);
        localStorage.setItem("login_fail_count", String(newFails));

        const ms = nextLockMs(newFails);
        if (ms > 0) {
          const until = now() + ms;
          setLockUntil(until);
          localStorage.setItem("login_lock_until", String(until));
          setMsg(
            data?.message ||
              `❌ Credenciales inválidas. Reintenta en ${Math.ceil(ms / 1000)}s.`
          );
        } else {
          setMsg(data?.message || "❌ Usuario o contraseña incorrectos.");
        }
        resetCaptcha();
        return;
      }

      // éxito
      localStorage.removeItem("login_fail_count");
      localStorage.removeItem("login_lock_until");
      setFailCount(0);
      setLockUntil(0);

      window.dispatchEvent(
        new CustomEvent("auth:changed", { detail: { authed: true } })
      );
      setSuccess(true);
      setMsg("");

      if ((data as any)?.ok && (data as any)?.redirect) {
        setTimeout(() => {
          window.location.href = (data as any).redirect as string; // SSO Flask
        }, 900);
        return;
      }

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 900);
    } catch {
      setMsg("❌ Error al conectar con el servidor.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-container">
      <section className="login-box" aria-labelledby="login-title">
        {/* Encabezado con gradiente */}
        <header className="cardHero">
          <h1 id="login-title" className="heroTitle">
            ¡Inicia sesión!
          </h1>
          <span className="heroBlob" aria-hidden="true" />
        </header>

        {success && (
          <div className="login-success">
            ✅ Inicio de sesión correcto. Redirigiendo…
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          {/* Email */}
          <label className="fgroup">
            <Mail className="ileft" aria-hidden="true" />
            <input
              className="input"
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy || locked}
            />
          </label>

          {/* Password */}
          <label className="fgroup">
            <Lock className="ileft" aria-hidden="true" />
            <input
              className="input"
              type={showPass ? "text" : "password"}
              placeholder="Contraseña (mín. 8)"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy || locked}
              minLength={8}
            />
            <button
              type="button"
              className="irightBtn"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              disabled={busy}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </label>

          {/* Captcha (suma/resta, permite negativos) */}
          <div className="captcha-row">
            <Shield size={18} className="icap" aria-hidden="true" />
            <span>
              ¿Cuánto es <strong>{captcha.a}</strong>{" "}
              <strong>{captcha.op}</strong> <strong>{captcha.b}</strong>?
            </span>
            <input
              // type="text" para permitir el signo "-" en móviles
              type="text"
              inputMode="numeric"
              pattern="-?[0-9]*"
              className="captcha-input"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              disabled={busy || locked}
              aria-label="Respuesta de captcha"
            />
            <button
              type="button"
              className="captcha-refresh"
              onClick={resetCaptcha}
              title="Nuevo captcha"
              disabled={busy}
            >
              ↻
            </button>
          </div>

          {msg && <p className="login-msg">{msg}</p>}

          <button type="submit" className="submit" disabled={busy || locked}>
            {busy ? "Procesando…" : locked ? "Bloqueado temporalmente" : (<><LogIn size={18} /> Ingresar</>)}
          </button>
        </form>
      </section>
    </main>
  );
}
