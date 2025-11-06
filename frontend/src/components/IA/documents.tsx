import { useState, useEffect } from "react";
import styles from "./documents.module.css";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:4000/api/auth";

export default function Documents() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"usuario" | "admin" | "comite">("usuario");

  const username = "Usuario Demo";
  const userId = 1;

  const [form, setForm] = useState({
    descripcionEntidad: "",
    tipoEntidad: "",
    objetoSocial: "",
    direccionFisica: "",
    residenciaBoyaca: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    rut: null,
    camara_comercio: null,
    cedula: null,
    carta_intencion: null,
    carta_aceptacion: null,
    antecedentes_contraloria: null,
    antecedentes_procuraduria: null,
    antecedentes_policia: null,
    antecedentes_rnmc: null,
  });

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [documentList, setDocumentList] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // ===================== FUNCIONES =====================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: selected } = e.target;
    if (selected && selected[0]) {
      setFiles((prev) => ({ ...prev, [name]: selected[0] }));
    }
  };

  // -------------------- USUARIO --------------------
  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    if (loading) return;

    try {
      setLoading(true);
      const createResp = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...form }),
      });

      const created = await createResp.json();
      if (!createResp.ok)
        throw new Error(created.message || "Error al crear documento.");

      const newDocId = created.document.id;
      setDocId(newDocId);

      for (const key in files) {
        const file = files[key];
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("field", key);

        await fetch(`${API_BASE}/upload/${newDocId}`, {
          method: "POST",
          body: formData,
        });
      }

      setMensaje("✅ Datos y archivos enviados correctamente.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      console.error(err);
      setMensaje("❌ Error al subir documentos.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- ADMIN & COMITÉ --------------------
  const fetchAllDocs = async () => {
    try {
      const resp = await fetch(`${API_BASE}/all`);
      const data = await resp.json();
      if (resp.ok) setDocumentList(data.documents);
      else setMensaje("No hay documentos disponibles.");
    } catch (err) {
      console.error(err);
      setMensaje("Error al obtener documentos.");
    }
  };

  const fetchDocsById = async (id: number) => {
    try {
      const resp = await fetch(`${API_BASE}/user/${id}`);
      const data = await resp.json();
      if (resp.ok && data.documents?.length > 0) {
        const doc = data.documents[0];
        setDocumentData(doc);
        setDocId(doc.id);
        fetchUploadedFiles(doc.id);
      } else {
        setMensaje("No se encontraron documentos.");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al buscar documento.");
    }
  };

  const fetchUploadedFiles = async (id: number) => {
    try {
      const resp = await fetch(`${API_BASE}/files/${id}`);
      const data = await resp.json();
      if (resp.ok) setUploadedFiles(data.files || []);
      else setUploadedFiles([]);
    } catch {
      setUploadedFiles([]);
    }
  };

  const handleAdminUpload = async (field: string) => {
    if (!docId || !files[field]) return;
    const formData = new FormData();
    formData.append("file", files[field]!);
    formData.append("field", field);

    const resp = await fetch(`${API_BASE}/admin/upload/${docId}`, {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();
    if (resp.ok) {
      setMensaje("✅ Archivo actualizado.");
      fetchUploadedFiles(docId);
    } else {
      setMensaje(data.message);
    }
  };

  const handleAdminDelete = async (field: string) => {
    if (!docId) return;
    const resp = await fetch(`${API_BASE}/admin/delete/${docId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setMensaje("🗑️ Archivo eliminado.");
      fetchUploadedFiles(docId);
    } else setMensaje(data.message);
  };

  const handleStatusChange = async (status: "aprobado" | "rechazado") => {
    if (!docId) return;
    const resp = await fetch(`${API_BASE}/status/${docId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await resp.json();
    if (resp.ok) {
      setMensaje(`📘 Estado actualizado a ${status}.`);
      fetchAllDocs();
    } else setMensaje(data.message);
  };

  useEffect(() => {
    if (role !== "usuario") fetchAllDocs();
  }, [role]);

  // ===================== RENDER =====================
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Panel de Documentos</h1>
          <p className={styles.subtitle}>
            Bienvenido, <strong>{username}</strong>
          </p>

          <div className={styles.roleSelect}>
            <label>Cambiar rol:</label>
            <select
              value={role}
              onChange={(e) => {
                setDocumentData(null);
                setRole(e.target.value as any);
              }}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="comite">Comité</option>
            </select>
          </div>
        </header>

        {/* ==================== USUARIO ==================== */}
        {role === "usuario" && (
          <form className={styles.form} onSubmit={handleSubmitAll}>
            <div className={styles.section}>
              <h2>Información de la Entidad</h2>
              {Object.entries(form).map(([key, val]) => (
                <div className={styles.formGroup} key={key}>
                  <label>{key.replaceAll("_", " ")}:</label>
                  <input name={key} value={val} onChange={handleChange} />
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <h2>Documentos Requeridos</h2>
              {Object.keys(files).map((key) => (
                <div className={styles.formGroup} key={key}>
                  <label>{key.replaceAll("_", " ")}:</label>
                  <input type="file" name={key} onChange={handleFileChange} />
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button type="submit" disabled={loading}>
                {loading ? "Subiendo..." : "🚀 Finalizar"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{ background: "#ccc", color: "#000" }}
              >
                Volver
              </button>
            </div>

            {mensaje && <p className={styles.message}>{mensaje}</p>}
          </form>
        )}

        {/* ==================== ADMIN & COMITÉ ==================== */}
        {(role === "admin" || role === "comite") && !documentData && (
          <div className={styles.section}>
            <h2>Solicitudes registradas</h2>
            {documentList.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Tipo Entidad</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {documentList.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.id}</td>
                      <td>{doc.userId}</td>
                      <td>{doc.tipoEntidad}</td>
                      <td>
                        {doc.estado === "aprobado"
                          ? "✅ Aprobado"
                          : doc.estado === "rechazado"
                          ? "❌ Rechazado"
                          : "⏳ Pendiente"}
                      </td>
                      <td>
                        <button onClick={() => fetchDocsById(doc.userId)}>
                          Ver solicitud
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hay solicitudes.</p>
            )}
          </div>
        )}

        {(role === "admin" || role === "comite") && documentData && (
          <div className={styles.section}>
            <h2>Detalles de la solicitud #{documentData.id}</h2>

            <p>
              <strong>Descripción:</strong> {documentData.descripcionEntidad}
            </p>
            <p>
              <strong>Tipo:</strong> {documentData.tipoEntidad}
            </p>
            <p>
              <strong>Objeto social:</strong> {documentData.objetoSocial}
            </p>
            <p>
              <strong>Dirección:</strong> {documentData.direccionFisica}
            </p>
            <p>
              <strong>Residencia:</strong> {documentData.residenciaBoyaca}
            </p>
            <p>
              <strong>Estado:</strong> {documentData.estado}
            </p>

            <h3>Archivos</h3>
            {Object.keys(files).map((key) => {
              const subido = uploadedFiles.some((f) => f.startsWith(key));
              return (
                <div
                  className={`${styles.formGroup} ${
                    subido ? styles.uploaded : styles.missing
                  }`}
                  key={key}
                >
                  <label>
                    {subido ? "🟩 " : "🟥 "}
                    {key.replaceAll("_", " ")}:
                  </label>
                  <div className={styles.actions}>
                    <button
                      onClick={() =>
                        window.open(
                          `${API_BASE}/files/${documentData.id}/${key}`
                        )
                      }
                      disabled={!subido}
                    >
                      Ver
                    </button>

                    {role === "admin" && (
                      <>
                        <input
                          type="file"
                          name={key}
                          onChange={handleFileChange}
                        />
                        <button onClick={() => handleAdminUpload(key)}>
                          Actualizar
                        </button>
                        <button onClick={() => handleAdminDelete(key)}>
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {role === "comite" && (
              <div className={styles.actions}>
                <button onClick={() => handleStatusChange("aprobado")}>
                  ✅ Aprobar
                </button>
                <button onClick={() => handleStatusChange("rechazado")}>
                  ❌ Rechazar
                </button>
              </div>
            )}

            <button
              style={{ marginTop: "1rem" }}
              onClick={() => setDocumentData(null)}
            >
              ← Volver a la lista
            </button>
          </div>
        )}

        {mensaje && <p className={styles.message}>{mensaje}</p>}
      </section>
    </main>
  );
}