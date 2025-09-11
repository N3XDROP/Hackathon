import React, { useEffect, useState } from "react";

type Props = {
  src: string;
  title?: string;
  height?: number;
};

export default function PdfViewer({ src, title = "Documento PDF", height = 540 }: Props) {
  const [exists, setExists] = useState<null | boolean>(null);

  useEffect(() => {
    let alive = true;
    // Verifica que el PDF exista para evitar mostrar la SPA en 404
    fetch(src, { method: "HEAD" })
      .then(r => alive && setExists(r.ok))
      .catch(() => alive && setExists(false));
    return () => { alive = false; };
  }, [src]);

  if (exists === false) {
    return (
      <div style={{
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        padding: 16,
        background: "var(--card-bg)",
        color: "var(--text)"
      }}>
        <p style={{ margin: 0, opacity: .85 }}>No se encontró el archivo.</p>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={src} className="button">Intentar descargar</a>
        </div>
      </div>
    );
  }

  return (
    <section style={{
      border: "1px solid var(--card-border)",
      borderRadius: 14,
      overflow: "hidden",
      background: "var(--card-bg)",
      color: "var(--text)"
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        padding: "10px 12px",
        borderBottom: "1px solid var(--card-border)",
        background: "linear-gradient(180deg, rgba(1,211,124,.10), transparent)"
      }}>
        <strong style={{ letterSpacing: -.2 }}>{title}</strong>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="button"
            style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--card-border)" }}
          >
            Abrir en pestaña
          </a>
          <a href={src} download className="button">Descargar</a>
        </div>
      </div>

      {/* Visor */}
      {exists === null ? (
        <div style={{ height, display: "grid", placeItems: "center" }}>
          <span style={{ opacity: .7 }}>Cargando…</span>
        </div>
      ) : (
        <object data={src} type="application/pdf" width="100%" height={height}>
          <iframe title={title} src={src} width="100%" height={height} style={{ border: 0 }} />
        </object>
      )}
    </section>
  );
}
