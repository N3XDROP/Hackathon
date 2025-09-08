import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./ServiceDetail.module.css";

type ServiceItem = { title: string; description: string };
type Service = {
  id: string;
  title: string;
  text: string;
  img: string;
  intro?: string;
  objective?: string;
  items?: ServiceItem[];
  benefits?: string[];
};

const API_URL = import.meta.env.VITE_API_URL || "";

// Fallbacks desde /public/images
const IMG_FALLBACK: Record<string, string> = {
  representacion: "/images/networking.jpg",
  innovacion: "/images/innovation.png",
  capacitacion: "/images/training.jpg",
  mercados: "/images/markets.png",
  consultorias: "/images/consulting.png",
};

export default function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();

  const [data, setData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    setLoading(true);
    fetch(`${API_URL}/api/services/${serviceId}`)
      .then(async (r) => {
        if (r.status === 404) throw new Error("Servicio no encontrado");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((svc: Service) => setData(svc))
      .catch((e) => setErr(e.message ?? "Error al cargar el servicio"))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return (
      <main className={styles.wrapper}>
        <p className={styles.muted}>Cargando…</p>
      </main>
    );
  }

  if (err || !data) {
    return (
      <main className={styles.wrapper}>
        <div className={styles.notFound}>
          <h1>Ups…</h1>
          <p className={styles.error}>{err ?? "Servicio no disponible"}</p>
          <Link to="/servicios" className={styles.backBtn}>← Volver a servicios</Link>
        </div>
      </main>
    );
  }

  const heroImg = resolveImg(data);

  return (
    <main className={styles.wrapper}>
      {/* Hero con imagen de fondo + overlay */}
      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${heroImg})` }}
        aria-label={data.title}
      >
        <div className={styles.heroOverlay} />
        {/* Card centrada sobre el hero */}
        <div className={styles.heroCard}>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.subtitle}>{data.text}</p>
          <div className={styles.heroActions}>
            <Link to="/servicios" className={styles.backBtn}>← Volver</Link>
          </div>
        </div>
      </section>

      {/* Contenido dentro de una única card */}
      <section className={styles.content}>
        <article className={styles.card}>
          {data.intro && (
            <>
              <h2 className={styles.sectionTitle}>Descripción</h2>
              <p className={styles.intro}>{data.intro}</p>
            </>
          )}

          {data.objective && (
            <>
              <div className={styles.divider} />
              <h3 className={styles.sectionTitle}>Objetivo</h3>
              <p className={styles.intro}>{data.objective}</p>
            </>
          )}

          {data.items && data.items.length > 0 && (
            <>
              <div className={styles.divider} />
              <h3 className={styles.sectionTitle}>¿Qué incluye?</h3>
              <ul className={styles.itemsGrid}>
                {data.items.map((it, idx) => (
                  <li key={idx} className={styles.item}>
                    <h4 className={styles.itemTitle}>{it.title}</h4>
                    <p className={styles.itemDesc}>{it.description}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          {data.benefits && data.benefits.length > 0 && (
            <>
              <div className={styles.divider} />
              <h3 className={styles.sectionTitle}>Beneficios</h3>
              <ul className={styles.benefitsList}>
                {data.benefits.map((b, i) => (
                  <li key={i} className={styles.benefit}>• {b}</li>
                ))}
              </ul>
            </>
          )}
        </article>
      </section>
    </main>
  );
}

function resolveImg(s: Service): string {
  if (/^https?:\/\//i.test(s.img)) return s.img;
  if (s.img?.startsWith("/")) return s.img;
  return IMG_FALLBACK[s.id] ?? "/images/networking.jpg";
}
