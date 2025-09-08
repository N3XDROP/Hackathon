import { Link } from "react-router-dom";
import styles from "./Aliados.module.css";

export default function Aliados() {
  return (
    <>
      {/* Afiliados y Alianzas */}
      <section className={styles.alliesSection} aria-labelledby="allies-title">
        <div className={styles.alliesInner}>
          <header className={styles.alliesHeader}>
            <h2 id="allies-title" className={styles.alliesTitle}>
              Afiliados y Alianzas Estratégicas
            </h2>
            <p className={styles.alliesText}>
              SUMERTIC cuenta con la participación de empresas tecnológicas de Boyacá,
              instituciones académicas y alianzas con entidades clave que respaldan nuestro
              trabajo y potencian el impacto regional.
            </p>
          </header>

          {/* Carrusel */}
          <div className={styles.forceMotion}>
          <div className={styles.logoScroller} role="region" aria-label="Aliados">
            <div className={styles.logoTrack} style={{ animation: 'scrollLogos 28s linear infinite', willChange: 'transform' }}>
              {/* Lista real */}
              <div className={styles.logoItem}>
                <img
                  src="/images/gob.png"
                  alt="Gobernación de Boyacá"
                  className={styles.partnerLogo}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/images/camara.jpg"
                  alt="Cámara de Comercio de Tunja"
                  className={styles.partnerLogo}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/images/Uni.jpg"
                  alt="Universidad Sergio Arboleda"
                  className={styles.partnerLogo}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/images/um.jpeg"
                  alt="UMCITI"
                  className={styles.partnerLogo}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/images/innpulsa.png"
                  alt="Innpulsa Colombia"
                  className={styles.partnerLogo}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <div className={styles.logoItem}>
                <img
                  src="/images/sennova.png"
                  alt="Sennova Sogamoso"
                  className={styles.partnerLogo}
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>

              {/* Duplicado para scroll infinito (oculto a accesibilidad y tab-orden) */}
              <div className={styles.logoItem} aria-hidden="true" tabIndex={-1}>
                <img src="/images/gob.png" alt="" className={styles.partnerLogo} draggable="false" />
              </div>
              <div className={styles.logoItem} aria-hidden="true" tabIndex={-1}>
                <img src="/images/camara.jpg" alt="" className={styles.partnerLogo} draggable="false" />
              </div>
              <div className={styles.logoItem} aria-hidden="true" tabIndex={-1}>
                <img src="/images/Uni.jpg" alt="" className={styles.partnerLogo} draggable="false" />
              </div>
              <div className={styles.logoItem} aria-hidden="true" tabIndex={-1}>
                <img src="/images/um.jpeg" alt="" className={styles.partnerLogo} draggable="false" />
              </div>
              <div className={styles.logoItem} aria-hidden="true" tabIndex={-1}>
                <img src="/images/innpulsa.png" alt="" className={styles.partnerLogo} draggable="false" />
              </div>
              <div className={styles.logoItem} aria-hidden="true" tabIndex={-1}>
                <img src="/images/sennova.png" alt="" className={styles.partnerLogo} draggable="false" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Logros */}
      <section className={styles.awardsSection} aria-labelledby="awards-title">
        <div className={styles.awardsInner}>
          <header className={styles.alliesHeader}>
            <h2 id="awards-title" className={styles.alliesTitle}>
              Logros Destacados
            </h2>
          </header>

          <ul className={styles.awardGrid}>
            <li className={styles.awardCard}>
              <div className={styles.awardMedia}>
                <img src="/images/images.jpeg" alt="Innovación educativa" className={styles.awardImage} />
              </div>
              <h3 className={styles.awardTitle}>Innovación en tecnología educativa</h3>
              <p className={styles.awardText}>
                Programas de capacitación en colegios de Boyacá que fortalecen
                las competencias digitales de estudiantes y docentes.
              </p>
            </li>

            <li className={styles.awardCard}>
              <div className={styles.awardMedia}>
                <img src="/images/digital.jpg" alt="Transformación digital regional" className={styles.awardImage} />
              </div>
              <h3 className={styles.awardTitle}>Transformación Digital Regional</h3>
              <p className={styles.awardText}>
                Acompañamiento a empresas locales para adoptar herramientas tecnológicas
                que optimizan procesos y operaciones.
              </p>
            </li>

            <li className={styles.awardCard}>
              <div className={styles.awardMedia}>
                <img src="/images/ali.jpeg" alt="Alianzas estratégicas" className={styles.awardImage} />
              </div>
              <h3 className={styles.awardTitle}>Alianzas estratégicas</h3>
              <p className={styles.awardText}>
                Trabajo conjunto con entidades del ecosistema en iniciativas de ciudades
                inteligentes y sostenibilidad.
              </p>
            </li>

            <li className={styles.awardCard}>
              <div className={styles.awardMedia}>
                <img src="/images/(1).jpeg" alt="Eventos e innovación" className={styles.awardImage} />
              </div>
              <h3 className={styles.awardTitle}>Eventos e innovación</h3>
              <p className={styles.awardText}>
                Organización de hackathons y foros tecnológicos que impulsan creatividad
                y solución de retos locales.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        style={{
          padding: "36px 0",
          background: "linear-gradient(90deg, var(--pri) 0%, var(--sec) 100%)",
          color: "#fff",
        }}
      >
        <div className="container" style={{ display: "grid", gap: 12, textAlign: "center" }}>
          <h3 style={{ margin: 0 }}>¿Quieres unirte al Clúster?</h3>
          <p style={{ margin: 0 }}>
            Inicia tu proceso y sube tus documentos para ser evaluado por el Comité de Ingreso.
          </p>
          <Link
            to="/login"
            style={{
              justifySelf: "center",
              padding: "12px 16px",
              borderRadius: 10,
              background: "#fff",
              color: "var(--sec)",
              fontWeight: 700,
            }}
          >
            Iniciar proceso
          </Link>
        </div>
      </section>
    </>
  );
}
