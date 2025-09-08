import { Link } from "react-router-dom";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            Impulsamos el ecosistema TIC en Boyacá
          </h1>
          <p className={styles.heroText}>
            Conectamos empresas, academia y sector público para acelerar la
            innovación y la competitividad.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/quienes-somos" className={styles.btnPrimary}>
              Conoce SumerTIC
            </Link>

          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className={styles.highlights}>
        <div className="container">
          <h2 className={styles.highlightsTitle}>Lo que hacemos</h2>
          <div className={styles.grid3}>
            <Card
              title="Articulación del ecosistema"
              text="Más de 15 empresas TIC y 30 actores vinculados para proyectos colaborativos."
            />
            <Card
              title="Formación y visibilidad"
              text="Capacitaciones, webinars y presencia en eventos nacionales e internacionales."
            />
            <Card
              title="Innovación y diagnóstico"
              text="Proyectos de innovación y diagnóstico empresarial para detectar oportunidades."
            />
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.cta}>
        <div className="container">
          <h3 className={styles.ctaTitle}>¿Quieres unirte al Clúster?</h3>
          <p className={styles.ctaText}>
            Inicia tu proceso y sube tus documentos para ser evaluado por el
            Comité de Ingreso.
          </p>
          <Link to="/login" className={styles.ctaBtn}>
            Iniciar proceso
          </Link>
        </div>
      </section>
    </>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="card">
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardText}>{text}</p>
    </div>
  );
}
