import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";

const API_URL = "http://localhost:4000/api/auth/register";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const validate = () => {
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setMensaje("⚠️ Completa todos los campos.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMensaje("⚠️ Ingresa un correo válido.");
      return false;
    }
    if (password.length < 8) {
      setMensaje("⚠️ La contraseña debe tener al menos 8 caracteres.");
      return false;
    }
    if (password !== confirm) {
      setMensaje("⚠️ Las contraseñas no coinciden.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (loading) return;
    setMensaje("");
    if (!validate()) return;

    try {
      setLoading(true);

      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🔒 El backend forzará el rol a "admin". Aquí NO enviamos role.
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setMensaje(data?.message || "❌ Error al registrar.");
        return;
      }

      setMensaje("✅ Usuario creado. Redirigiendo al login…");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err: any) {
      console.error("Error en el registro:", err?.message || err);
      setMensaje("❌ Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        {/* Cabecera curvada al estilo de la maqueta */}
        <div className={styles.header} aria-hidden="true">
          <p className={styles.kicker}>Bienvenido a SumerTIC</p>
          <div className={styles.title}>¡Crea tu cuenta!</div>
          {/* hojita decorativa minimal */}
          <svg viewBox="0 0 24 24" className={styles.leaf}>
            <path
              fill="#fff"
              d="M12 2c4.5 0 8 3.5 8 8 0 5.8-5.4 9.7-7.3 10.9a1 1 0 0 1-1.4-.4C9.3 18.2 4 14 4 10c0-4.5 3.5-8 8-8z"
              opacity=".35"
            />
          </svg>
        </div>

        <div className={styles.body}>
          <h1>Registrarse</h1>

          <div className={styles.field}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M20 4H4a2 2 0 0 0-2 2v1l10 6 10-6V6a2 2 0 0 0-2-2Zm0 6.35-8 4.8-8-4.8V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"
              />
            </svg>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className={styles.input}
            />
          </div>

          <div className={`${styles.field} ${styles.passwordWrapper}`}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-3 0H10V6a2 2 0 1 1 4 0Z"
              />
            </svg>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Contraseña (mín. 8)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className={styles.toggleBtn}
            >
              {showPwd ? "Ocultar" : "Ver"}
            </button>
          </div>

          <div className={`${styles.field} ${styles.passwordWrapper}`}>
            <svg className={styles.icon} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-3 0H10V6a2 2 0 1 1 4 0Z"
              />
            </svg>
            <input
              type={showConfirmPwd ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd((s) => !s)}
              className={styles.toggleBtn}
            >
              {showConfirmPwd ? "Ocultar" : "Ver"}
            </button>
          </div>

          {/* 🔻 Eliminado: selector de rol */}

          <button onClick={handleRegister} disabled={loading} className={styles.btn}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

          <div className={styles.alt}>
            <span className={styles.rule}></span>
            <span>o</span>
            <span className={styles.rule}></span>
          </div>

          {mensaje && <p className={styles.message}>{mensaje}</p>}

          <p className={styles.footer}>
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
