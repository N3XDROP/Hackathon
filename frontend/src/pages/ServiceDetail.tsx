import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./ServiceDetail.module.css";

/* Íconos de lucide-react */
import {
  Network,
  Atom,
  GraduationCap,
  ShoppingCart,
  ShieldCheck,
  Layers,
  Rocket,
  Lightbulb,
  Users,
  Award,
  CheckCircle2,
  FileText,
  Target,
} from "lucide-react";

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

/* ✅ tipo más fácil: usamos el tipo de cualquier icono */
type IconType = typeof Network;

const API_URL = import.meta.env.VITE_API_URL || "";

/* Fallbacks desde /public/images */
const IMG_FALLBACK: Record<string, string> = {
  representacion: "/images/networking.jpg",
  innovacion: "/images/innovation.png",
  capacitacion: "/images/training.jpg",
  mercados: "/images/markets.png",
  consultorias: "/images/consulting.png",
};

/* ====== Ícono del hero por id de servicio ====== */
const HERO_ICON_BY_ID: Record<string, IconType> = {
  representacion: Network,
  innovacion: Lightbulb,
  capacitacion: GraduationCap,
  mercados: ShoppingCart,
  consultorias: Users,
};

/* ====== Normalización básica ====== */
function normalizeBasic(s: string) {
  const map: Record<string, string> = {
    á: "a",
    à: "a",
    ä: "a",
    â: "a",
    ã: "a",
    å: "a",
    Á: "a",
    À: "a",
    Ä: "a",
    Â: "a",
    Ã: "a",
    é: "e",
    è: "e",
    ë: "e",
    ê: "e",
    É: "e",
    È: "e",
    Ë: "e",
    Ê: "e",
    í: "i",
    ì: "i",
    ï: "i",
    î: "i",
    Í: "i",
    Ì: "i",
    Ï: "i",
    Î: "i",
    ó: "o",
    ò: "o",
    ö: "o",
    ô: "o",
    õ: "o",
    Ó: "o",
    Ò: "o",
    Ö: "o",
    Ô: "o",
    Õ: "o",
    ú: "u",
    ù: "u",
    ü: "u",
    û: "u",
    Ú: "u",
    Ù: "u",
    Ü: "u",
    Û: "u",
    ñ: "n",
    Ñ: "n",
  };
  return s
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase();
}

/* ====== Heurística de íconos ====== */
function iconForItem(title: string, description: string): IconType {
  const t = normalizeBasic(`${title} ${description}`);

  if (t.match(/seguridad|security|proteccion|riesgo|cumplimiento|compliance/))
    return ShieldCheck;
  if (t.match(/red|network|representacion|conectividad/)) return Network;
  if (t.match(/innovacion|ia|ml|inteligencia|ciencia/)) return Atom;
  if (t.match(/capacitacion|formacion|curso|taller|entrenamiento|academ/))
    return GraduationCap;
  if (t.match(/mercado|comercial|ventas|clientes|posicionamiento/))
    return ShoppingCart;
  if (t.match(/implementacion|despliegue|arquitectura|integracion|capas/))
    return Layers;
  if (t.match(/estrategia|transformacion|roadmap|lanzamiento|escalado/))
    return Rocket;
  if (t.match(/idea|oportunidad|creatividad|prototip/)) return Lightbulb;
  if (t.match(/equipo|talento|personas|mentoria|acompanamiento|consultor/))
    return Users;
  if (t.match(/gobernanza|certificacion|buenas practicas|reconocimiento/))
    return Award;

  return CheckCircle2;
}

export default function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();

  const [data, setData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) {
      setErr("Falta el parámetro :serviceId en la URL.");
      setLoading(false);
      return;
    }
    const url = `${API_URL ? API_URL : ""}/api/services/${serviceId}`;
    fetch(url)
      .then(async (r) => {
        if (r.status === 404) throw new Error("Servicio no encontrado (404)");
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
          <Link to="/servicios" className={styles.backBtn}>
            ← Volver a servicios
          </Link>
        </div>
      </main>
    );
  }

  const heroImg = resolveImg(data);
  const HeroIcon = (HERO_ICON_BY_ID[data.id] || Lightbulb) as IconType;

  return (
    <main className={styles.wrapper}>
      {/* Hero */}
      <section
        className={`${styles.hero} ${styles.appearUp ?? ""}`}
        style={{ backgroundImage: `url(${heroImg})` }}
        aria-label={data.title}
      >
        <div className={styles.heroOverlay} />
        <div className={`${styles.heroCard} ${styles.pop ?? ""}`}>
          <div className={styles.heroIconWrap} aria-hidden="true">
            <HeroIcon size={44} className={styles.heroIcon} />
          </div>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.subtitle}>{data.text}</p>
          <div className={styles.heroActions}>
            <Link to="/servicios" className={styles.backBtn}>
              ← Volver
            </Link>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className={styles.content}>
        <article className={`${styles.card} ${styles.appearUp ?? ""}`}>
          {data.intro && (
            <>
              <div className={styles.sectionHeader}>
                <FileText size={18} />
                <h2 className={styles.sectionTitle}>Descripción</h2>
              </div>
              <p className={styles.intro}>{data.intro}</p>
            </>
          )}

          {data.objective && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionHeader}>
                <Target size={18} />
                <h3 className={styles.sectionTitle}>Objetivo</h3>
              </div>
              <p className={styles.intro}>{data.objective}</p>
            </>
          )}

          {data.items && data.items.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionHeader}>
                <Layers size={18} />
                <h3 className={styles.sectionTitle}>¿Qué incluye?</h3>
              </div>

              <ul className={`${styles.itemsGrid} ${styles.staggerList ?? ""}`}>
                {data.items.map((it, idx) => {
                  const ItemIcon = iconForItem(
                    it.title ?? "",
                    it.description ?? ""
                  ) as IconType;
                  return (
                    <li
                      key={idx}
                      className={`${styles.item} ${styles.staggerItem ?? ""}`}
                      style={{ ["--index" as any]: idx }}
                    >
                      <div className={styles.itemTitleRow}>
                        <span className={styles.itemIcon} aria-hidden="true">
                          <ItemIcon size={18} />
                        </span>
                        <h4 className={styles.itemTitle}>{it.title}</h4>
                      </div>
                      <p className={styles.itemDesc}>{it.description}</p>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {data.benefits && data.benefits.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.sectionHeader}>
                <CheckCircle2 size={18} />
                <h3 className={styles.sectionTitle}>Beneficios</h3>
              </div>

              <ul
                className={`${styles.benefitsList} ${styles.staggerList ?? ""}`}
              >
                {data.benefits.map((b, i) => (
                  <li
                    key={i}
                    className={`${styles.benefit} ${styles.staggerItem ?? ""}`}
                    style={{ ["--index" as any]: i }}
                  >
                    <CheckCircle2 size={16} style={{ marginRight: 8 }} />
                    {b}
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </section>
            {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <h3 className={styles.ctaTitle}>¿Interesado en nuestros servicios?</h3>
          <p className={styles.ctaText}>
            Si alguno de nuestros servicios te interesa, ¡contáctanos y empieza a
            transformar tu empresa!
          </p>
          <Link to="/login" className={styles.ctaBtn}>
            Iniciar proceso
          </Link>
        </div>
      </section>
    </main>
  );
}

function resolveImg(s: Service): string {
  if (/^https?:\/\//i.test(s.img)) return s.img;
  if (s.img?.startsWith("/")) return s.img;
  return IMG_FALLBACK[s.id] ?? "/images/networking.jpg";
}
