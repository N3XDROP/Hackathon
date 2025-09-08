import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section style={{ padding: "56px 0", background: "var(--surface)" }}>
        <div className="container" style={{ display: "grid", gap: 16, textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "2.4rem", color: "var(--sec)" }}>
            Impulsamos el ecosistema TIC en Boyacá
          </h1>
          <p style={{ margin: "8px auto 0", maxWidth: 760 }}>
            Conectamos empresas, academia y sector público para acelerar la innovación y la competitividad.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
            <Link
              to="/quienes-somos"
              style={{ padding: "12px 16px", borderRadius: 10, background: "var(--pri)", color: "#fff", fontWeight: 700 }}
            >
              Conoce SumerTIC
            </Link>
            <Link
              to="/aliados"
              style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid var(--sec)", color: "var(--sec)", fontWeight: 700 }}
            >
             Aliadoz
            </Link>
            <Link
              to="/contacto"
              style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid var(--sec)", color: "var(--sec)", fontWeight: 700 }}
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section style={{ padding: "36px 0" }}>
        <div className="container" style={{ display: "grid", gap: 16 }}>
          <h2 style={{ margin: 0, color: "var(--sec)" }}>Lo que hacemos</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
            }}
          >
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

          <style>{`
            @media (min-width: 900px){
              .home-grid-3 {
                display:grid;
                grid-template-columns: repeat(3, 1fr);
                gap:16px;
              }
            }
          `}</style>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "36px 0", background: "linear-gradient(90deg, var(--pri) 0%, var(--sec) 100%)", color: "#fff" }}>
        <div className="container" style={{ display: "grid", gap: 12, textAlign: "center" }}>
          <h3 style={{ margin: 0 }}>¿Quieres unirte al Clúster?</h3>
          <p style={{ margin: 0 }}>Inicia tu proceso y sube tus documentos para ser evaluado por el Comité de Ingreso.</p>
          <Link
            to="/login"
            style={{ justifySelf: "center", padding: "12px 16px", borderRadius: 10, background: "#fff", color: "var(--sec)", fontWeight: 700 }}
          >
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
      <h3 style={{ marginTop: 0, color: "var(--sec)" }}>{title}</h3>
      <p style={{ marginBottom: 0 }}>{text}</p>
    </div>
  );
}
