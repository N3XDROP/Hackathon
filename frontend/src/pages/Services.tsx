import { Link } from "react-router-dom";
import styles from "./Services.module.css";
import { useEffect, useState } from "react";

type Service = {
  id: string;
  title: string;
  text: string;
  img: string; // puede venir como URL absoluta o ruta relativa (/images/..)
  // en el detalle puedes tener intro, objective, items, benefits...
};

// ✅ Fallbacks desde public/images
const IMG_FALLBACK: Record<string, string> = {
  representacion: "/images/networking.jpg",
  innovacion: "/images/innovation.png",
  capacitacion: "/images/training.jpg",
  mercados: "/images/markets.png",
  consultorias: "/images/consulting.png",
};

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/services`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Service[]) => setServices(data))
      .catch((e) => setErr(e.message ?? "Error al cargar servicios"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>Servicios del Clúster</h1>
          <p className={styles.heroText}>
            Descubre los servicios especializados que ofrecemos para apoyar el
            crecimiento de tu empresa y mejorar la competitividad en el ecosistema
            tecnológico.
          </p>
        </div>
      </section>

      {/* Estado: cargando / error */}
      <section className={styles.highlights}>
        <div className="container">
          <h2 className={styles.highlightsTitle}>Áreas de Servicio</h2>

          {loading && <p className={styles.muted}>Cargando servicios…</p>}
          {err && !loading && (
            <p className={styles.error}>Ocurrió un error: {err}</p>
          )}
          {!loading && !err && services.length === 0 && (
            <p className={styles.muted}>Aún no hay servicios configurados.</p>
          )}

          {!loading && !err && services.length > 0 && (
            <div className={styles.grid3}>
              {services.map((s) => (
                <Card
                  key={s.id}
                  title={s.title}
                  text={s.text}
                  link={`/servicios/${s.id}`}
                  img={resolveImg(s)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <h3 className={styles.ctaTitle}>¿Interesado en nuestros servicios?</h3>
          <p className={styles.ctaText}>
            Si alguno de nuestros servicios te interesa, ¡contáctanos y empieza a
            transformar tu empresa!
          </p>
          <Link to="/contacto" className={styles.ctaBtn}>
            Contáctanos
          </Link>
        </div>
      </section>
    </>
  );
}

function resolveImg(s: Service): string {
  if (/^https?:\/\//i.test(s.img)) return s.img; // URL absoluta
  if (s.img?.startsWith("/")) return s.img; // ruta absoluta desde public/
  return IMG_FALLBACK[s.id] ?? "/images/networking.jpg"; // fallback
}

// Tarjeta de servicio
function Card({
  title,
  text,
  link,
  img,
}: {
  title: string;
  text: string;
  link: string;
  img: string;
}) {
  return (
    <div className={styles.card}>
      {/* Imagen encima */}
      <div
        className={styles.cardImage}
        style={{ backgroundImage: `url(${img})` }}
      />
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardText}>{text}</p>
        <Link to={link} className={styles.cardLink}>
          Ver más
        </Link>
      </div>
    </div>
  );
}
