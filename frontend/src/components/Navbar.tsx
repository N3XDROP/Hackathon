import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { branding } from "../config/branding";
import Logo from "./Logo";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detecta tema inicial y lo aplica inmediatamente en <html>
  useEffect(() => {
  // 1️⃣ Tema guardado en localStorage
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
    return;
  }

  // 2️⃣ Revisar si <html> ya tiene data-theme
  const htmlTheme = document.documentElement.getAttribute("data-theme");
  if (htmlTheme === "light" || htmlTheme === "dark") {
    setTheme(htmlTheme);
    return;
  }

  // 3️⃣ Usar preferencia del sistema como fallback
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersDark = mediaQuery.matches;
  const initialTheme = prefersDark ? "dark" : "light";
  setTheme(initialTheme);
  document.documentElement.setAttribute("data-theme", initialTheme);

  // 🔔 Listener compatible con todos los navegadores
  const listener = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };
  mediaQuery.addListener(listener); // funciona en todos los navegadores

  return () => {
    mediaQuery.removeListener(listener);
  };
}, []);

  // Verificar si hay sesión activa
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Escuchar cambios de autenticación
    const handleAuthChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("auth:changed", handleAuthChange);
    return () => window.removeEventListener("auth:changed", handleAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      setIsLoggedIn(false);
      navigate("/");
      window.dispatchEvent(
        new CustomEvent("auth:changed", { detail: { authed: false } })
      );
    }
  };

  // Persiste cambios de tema en localStorage y HTML
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Evita scroll del fondo cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header>
      {/* Franja superior */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContent}`}>
          <span>
            <strong>{branding.name}</strong> · Innovación que conecta
          </span>
          <span style={{ opacity: 0.9 }}>Conoce más en “Quiénes Somos”</span>
        </div>
      </div>

      {/* Barra principal */}
      <div className={styles.navbar}>
        <div className={`container ${styles.navbarContent}`}>
          <Link
            to="/"
            aria-label="Ir al inicio"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <Logo variant="clean" height={70} />
          </Link>

          <nav className={styles.navDesktop} aria-label="Navegación principal">
            {branding.nav.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}

            {!isLoggedIn ? (
              <>
                <Link to="/login" className={styles.loginButton}>
                  Ingresar
                </Link>
                <Link to="/register" className={styles.loginButton}>
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                <Link to="/documents" className={styles.loginButton}>
                  Panel
                </Link>
                <button 
                  onClick={handleLogout} 
                  className={styles.loginButton}
                  style={{ background: "#d32f2f", cursor: "pointer" }}
                >
                  Cerrar Sesión
                </button>
              </>
            )}

            {/* Botón Dark/Light */}
            <button
              onClick={toggleTheme}
              className={styles.darkToggle}
              aria-pressed={theme === "dark"}
              title="Cambiar tema"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </nav>

          {/* Toggle hamburguesa (visible en móvil) */}
          <button
            className={styles.toggle}
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="mobile-menu"
            type="button"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className={styles.mobileOverlay} onClick={() => setOpen(false)}>
          <div
            id="mobile-menu"
            className={styles.mobileMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileHeader}>
              <Logo variant="clean" height={50} />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className={styles.toggle}
              >
                ✕
              </button>
            </div>

            <nav className={styles.mobileNav} aria-label="Navegación móvil">
              {branding.nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `${styles.mobileItem} ${isActive ? styles.active : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={styles.mobileActions}>
              <button onClick={toggleTheme} className={styles.mobileThemeToggle}>
                {theme === "dark" ? "☀️ " : "🌙 "}
              </button>

              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={styles.mobileLogin}
                  >
                    Ingresar
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className={styles.mobileLogin}
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/documents"
                    onClick={() => setOpen(false)}
                    className={styles.mobileLogin}
                  >
                    Panel
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className={styles.mobileLogin}
                    style={{ background: "#d32f2f", cursor: "pointer" }}
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
      }
    >
      {({ isActive }) => (
        <span style={{ position: "relative" }}>
          {label}
          <span
            className={styles.underline}
            style={{ transform: `scaleX(${isActive ? 1 : 0})` }}
          />
        </span>
      )}
    </NavLink>
  );
}
