// src/pages/NormativaCuotas.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  ChevronDown,
  EyeOff,
  FileDown,
  ExternalLink,
  Receipt,
} from "lucide-react";
import PdfViewer from "../components/PdfViewer";
import styles from "./normativaCuotas.module.css";

// Config local (sin imports externos)
const FEES = {
  effectiveFrom: "2025-01-01",
  ordinaryMonthly: 200_000,
  extraordinary: 200_000,
  billingNote:
    "La cuota se factura electrónicamente a nombre de la empresa, mes vencido.",
};

const fmtCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// PDFs servidos desde public/docs/
const estatutosURL = "/docs/estatutos.pdf";
const cuotasHistoricoURL = "/docs/cuotas.pdf";

export default function NormativaCuotas() {
  const [showEstatutosPDF, setShowEstatutosPDF] = useState(false);
  const [showCuotasPDF, setShowCuotasPDF] = useState(false);

  const lastUpdate = useMemo(
    () =>
      new Date(FEES.effectiveFrom).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
      }),
    []
  );

  return (
    <main className={`container ${styles.wrap}`}>
      {/* ---------- Header ---------- */}
      <section className={`card ${styles.header}`}>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <ShieldCheck
              size={22}
              className={styles.heroIcon}
              aria-hidden="true"
            />
            <div>
              <h1 className={styles.title}>Normativa y Cuotas</h1>
              <p className={styles.lead}>
                Consulta los estatutos y compromisos del clúster y revisa las
                cuotas de afiliación y sostenimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- ESTATUTOS ---------- */}
      <section className={`card ${styles.section}`}>
        <header className={styles.sectionHead}>
          <div className={styles.sectionTitleWrap}>
            <span className={styles.bubble} aria-hidden="true">
              <FileText size={16} />
            </span>
            <h2 className={styles.sectionTitle}>
              Estatutos, reglamento y compromisos
            </h2>
          </div>

          <div className={styles.headActions}>
            <a href={estatutosURL} download className={styles.link}>
              <FileDown size={16} /> Descargar PDF
            </a>

            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowEstatutosPDF((v) => !v)}
              aria-expanded={showEstatutosPDF}
              aria-controls="estatutos-pdf"
            >
              {/* Icono ajustado: FileText para "Ver", EyeOff para "Ocultar" */}
              {showEstatutosPDF ? <EyeOff size={16} /> : <FileText size={16} />}
              {showEstatutosPDF ? "Ocultar PDF" : "Ver PDF"}
              <ChevronDown
                size={16}
                className={`${styles.chev} ${
                  showEstatutosPDF ? styles.chevOpen : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </header>

        {/* Mini resumen */}
        <ul className={styles.list}>
          <li>Gobernanza del clúster: órganos, roles y responsabilidades.</li>
          <li>Derechos y deberes de los miembros; participación activa.</li>
          <li>Reglamento interno y uso responsable de la marca.</li>
          <li>Ingreso, permanencia y causales de retiro.</li>
        </ul>

        {/* Visor PDF con toggle */}
        <div
          id="estatutos-pdf"
          className={`${styles.collapse} ${
            showEstatutosPDF ? styles.open : ""
          }`}
        >
          {showEstatutosPDF && (
            <div className={styles.pdfWrap}>
              <PdfViewer
                src={estatutosURL}
                title="Estatutos del Clúster"
                height={560}
              />
            </div>
          )}
        </div>
      </section>

      {/* ---------- CUOTAS ---------- */}
      <section className={`card ${styles.section}`}>
        <header className={styles.sectionHead}>
          <div className={styles.sectionTitleWrap}>
            <span className={styles.bubble} aria-hidden="true">
              <Receipt size={16} />
            </span>
            <h2 className={styles.sectionTitle}>Cuotas y condiciones</h2>
          </div>

          <div className={styles.headActions}>
            {/* Toggle del histórico (opcional) */}
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowCuotasPDF((v) => !v)}
              aria-expanded={showCuotasPDF}
              aria-controls="cuotas-pdf"
              title="Ver histórico (PDF anterior)"
            >
              {showCuotasPDF ? <EyeOff size={16} /> : <FileText size={16} />}
              {showCuotasPDF ? "Ocultar histórico" : "Ver histórico (PDF)"}
              <ChevronDown
                size={16}
                className={`${styles.chev} ${
                  showCuotasPDF ? styles.chevOpen : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </header>

        <p className={styles.muted}>
          Cuotas vigentes a partir de <strong>{lastUpdate}</strong>.
        </p>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td>Cuota ordinaria</td>
                <td className={styles.tdRight}>
                  {fmtCOP.format(FEES.ordinaryMonthly)} / mes
                </td>
              </tr>
              <tr>
                <td>Cuota extraordinaria</td>
                <td className={styles.tdRight}>
                  {fmtCOP.format(FEES.extraordinary)}
                </td>
              </tr>
              <tr>
                <td>Condiciones</td>
                <td className={styles.tdRight}>{FEES.billingNote}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PDF histórico (opcional). Si no lo usas, borra todo este bloque */}
        <div
          id="cuotas-pdf"
          className={`${styles.collapse} ${showCuotasPDF ? styles.open : ""}`}
        >
          {showCuotasPDF && (
            <div className={styles.pdfWrap}>
              <PdfViewer
                src={cuotasHistoricoURL}
                title="Histórico de cuotas"
                height={540}
              />
            </div>
          )}
        </div>
      </section>


      <section className={`${styles.cta} ${styles.fullBleed}`}>
        <div className="container">
          <h3 className={styles.ctaTitle}>
            ¿Interesado en nuestros servicios?
          </h3>
          <p className={styles.ctaText}>
            Si alguno de nuestros servicios te interesa, ¡contáctanos y empieza
            a transformar tu empresa!
          </p>
          <Link to="/login" className={styles.ctaBtn}>
            Iniciar proceso
          </Link>
        </div>
      </section>
    </main>
  );
}
