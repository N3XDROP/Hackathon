import { NavLink, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { branding } from "../config/branding";
import Logo from "./Logo";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const location = useLocation();

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

            <Link to="/login" className={styles.loginButton}>
              Ingresar
            </Link>
              <Link to="/register" className={styles.loginButton}>
             Registrarse
            </Link>

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

              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className={styles.mobileLogin}
              >
                Ingresar
              </Link>
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
