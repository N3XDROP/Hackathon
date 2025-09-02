import { branding } from "../config/branding";
import Logo from "./Logo";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        {/* Marca */}
        <div className={styles.brand}>
          <Logo variant="alt" height={30} />
          <strong>{branding.name}</strong>
        </div>

        {/* Información */}
        <div className={styles.info}>
          <span>© {new Date().getFullYear()} {branding.name}. Todos los derechos reservados.</span>
          <span>Contacto: info@sumertic.org</span>

          {/* Links opcionales */}
          <div className={styles.links}>
            <a href="/politica-privacidad">Política de Privacidad</a>
            <a href="/terminos-condiciones">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
