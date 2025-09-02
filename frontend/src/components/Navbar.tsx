import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { branding } from "../config/branding";
import Logo from "./Logo";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      {/* Franja superior */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarContent}`}>
          <span><strong>{branding.name}</strong> · Innovación que conecta</span>
          <span style={{ opacity: 0.9 }}>Conoce más en “Quiénes Somos”</span>
        </div>
      </div>

      {/* Barra principal */}
      <div className={styles.navbar}>
        <div className={`container ${styles.navbarContent}`}>
          <Link to="/" aria-label="Ir al inicio" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo variant="icon" height={50} />   {/* 40–48px va bien */}
          </Link>

          <nav className={styles.navDesktop}>
            {branding.nav.map((item) => (
              <NavItem key={item.to} to={item.to} label={item.label} />
            ))}
            <Link to="/login" className={styles.loginButton}>Ingresar</Link>
          </nav>

          <button className={styles.toggle} onClick={() => setOpen((v) => !v)} aria-label="Abrir menú">
            ☰
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className={styles.mobileOverlay} onClick={() => setOpen(false)}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <Logo variant="icon" height={28} />
              <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className={styles.toggle}>✕</button>
            </div>
            {branding.nav.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `${styles.mobileItem} ${isActive ? "active" : ""}`
                }>
                {item.label}
              </NavLink>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className={styles.mobileLogin}>
              Ingresar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className={styles.navItem}>
      {({ isActive }) => (
        <span style={{ position: "relative" }}>
          {label}
          <span className={styles.underline} style={{ transform: `scaleX(${isActive ? 1 : 0})` }} />
        </span>
      )}
    </NavLink>
  );
}
