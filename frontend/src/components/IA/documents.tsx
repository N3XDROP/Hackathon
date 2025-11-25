import { useState, useEffect } from "react";
import styles from "./documents.module.css";
import { useNavigate } from "react-router-dom";
import { useTokenRefresh } from "../../hooks/useTokenRefresh";

const API_BASE = "http://localhost:4000/api";

interface UserData {
  id: number;
  email: string;
  name: string;
  role: "0" | "1" | "2" | "usuario" | "admin" | "comite";
}

export default function Documents() {
  const navigate = useNavigate();
  useTokenRefresh();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [role, setRole] = useState<"usuario" | "admin" | "comite">("usuario");

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

  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docId, setDocId] = useState<number | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [documentList, setDocumentList] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [mensaje, setMensaje] = useState("");

  // ----------------- Helpers -----------------
  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const normalizeRoleName = (r: string | undefined | null) => {
    if (!r) return "usuario";
    const rr = String(r).toLowerCase();
    if (rr === "1" || rr === "admin") return "admin";
    if (rr === "2" || rr === "comite") return "comite";
    return "usuario";
  };

  // ===================== CARGAR DATOS DEL USUARIO =====================
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userRaw = localStorage.getItem("user");
        if (!userRaw) {
          setMensaje("No hay sesión activa. Redirigiendo...");
          setTimeout(() => navigate("/login"), 1500);
          return;
        }

        const user = JSON.parse(userRaw) as UserData;

        console.log("👤 Usuario cargado:", user);

        const finalRole = normalizeRoleName(user.role as string);

        localStorage.setItem("userRole", finalRole);

        setUserData(user);
        setRole(finalRole as "usuario" | "admin" | "comite");
      } catch (error) {
        console.error("Error leyendo user:", error);
        setMensaje("Error al cargar usuario. Inicia sesión nuevamente.");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    loadUserData();
  }, [navigate]);

  // ===================== INPUTS =====================
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

  // ===================== SUBMIT USUARIO =====================
  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (isLoadingDocs) return;

    if (!userData) {
      setMensaje("No se encontró usuario. Inicia sesión de nuevo.");
      return;
    }

    try {
      setIsLoadingDocs(true);

      // 🚀 Ruta corregida
      const createResp = await fetch(`${API_BASE}/documents/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ userId: userData.id, ...form }),
      });

      const created = await createResp.json();
      if (!createResp.ok)
        throw new Error(created.message || "Error al crear documento.");

      const newDocId = created.document.id;
      setDocId(newDocId);

      // Subir archivos
      for (const key in files) {
        const file = files[key];
        if (!file) continue;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("field", key);

        // 🚀 Ruta corregida
        await fetch(`${API_BASE}/documents/upload/${newDocId}`, {
          method: "POST",
          headers: { ...getAuthHeaders() },
          body: formData,
        });
      }

      setMensaje("✅ Datos y archivos enviados correctamente.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      console.error(err);
      setMensaje("❌ Error al subir documentos.");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // =============== ADMIN & COMITÉ ===============
  const fetchAllDocs = async () => {
    try {
      const resp = await fetch(`${API_BASE}/documents/all`, {
        headers: { ...getAuthHeaders() },
      });

      if (!resp.ok) {
        const err = await resp.text();
        console.error("fetchAllDocs error:", err);
        return;
      }

      const data = await resp.json();
      setDocumentList(data.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocsById = async (id: number) => {
    try {
      console.log(`🔍 Llamando a /api/auth/user/${id}`);
      const resp = await fetch(`${API_BASE}/auth/user/${id}`, {
        headers: { ...getAuthHeaders() },
      });

      console.log(`📝 Respuesta: ${resp.status} ${resp.statusText}`);

      if (!resp.ok) {
        console.error(`❌ Error ${resp.status}:`, await resp.text());
        setMensaje(`Error al obtener documentos (${resp.status})`);
        return;
      }

      const data = await resp.json();
      console.log("✅ Documentos recibidos:", data);

      if (data.documents?.length > 0) {
        const doc = data.documents[0];
        setDocumentData(doc);
        setDocId(doc.id);
        fetchUploadedFiles(doc.id);
      } else {
        setMensaje("No se encontraron documentos para este usuario.");
      }
    } catch (err) {
      console.error("❌ Error en fetchDocsById:", err);
      setMensaje(`Error al obtener documentos: ${err}`);
    }
  };

  const fetchUploadedFiles = async (id: number) => {
    try {
      const resp = await fetch(`${API_BASE}/documents/files/${id}`, {
        headers: { ...getAuthHeaders() },
      });

      if (!resp.ok) return;

      const data = await resp.json();
      setUploadedFiles(data.files || []);
    } catch {
      setUploadedFiles([]);
    }
  };

  const handleAdminUpload = async (field: string) => {
    if (!docId || !files[field]) return;

    const formData = new FormData();
    formData.append("file", files[field]!);
    formData.append("field", field);

    const resp = await fetch(`${API_BASE}/documents/admin/upload/${docId}`, {
      method: "POST",
      headers: { ...getAuthHeaders() },
      body: formData,
    });

    if (!resp.ok) return;

    fetchUploadedFiles(docId);
  };

  const handleAdminDelete = async (field: string) => {
    if (!docId) return;

    const resp = await fetch(`${API_BASE}/documents/admin/delete/${docId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ field }),
    });

    if (!resp.ok) return;

    fetchUploadedFiles(docId);
  };

  const handleStatusChange = async (status: "aprobado" | "rechazado") => {
    if (!docId) return;

    const resp = await fetch(`${API_BASE}/documents/status/${docId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });

    if (!resp.ok) return;

    fetchAllDocs();
  };

  useEffect(() => {
    console.log("📊 useEffect ejecutado — rol:", role);
    if (role !== "usuario") fetchAllDocs();
  }, [role]);

  // ================= RENDER =================
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Panel de Documentos</h1>
          <p className={styles.subtitle}>
            Bienvenido, <strong>{userData?.name}</strong>
          </p>

          <div className={styles.roleSelect}>
            <label>
              Rol:{" "}
              <strong>
                {role === "admin"
                  ? "Administrador"
                  : role === "comite"
                  ? "Comité"
                  : "Usuario"}
              </strong>
            </label>
          </div>
        </header>

        {/* ================= USUARIO ================= */}
        {role === "usuario" && (
          <form className={styles.form} onSubmit={handleSubmitAll}>
            <div className={styles.section}>
              <h2>Información de la Entidad</h2>
              {Object.entries(form).map(([k, v]) => (
                <div className={styles.formGroup} key={k}>
                  <label>{k.replaceAll("_", " ")}:</label>
                  <input name={k} value={v} onChange={handleChange} />
                </div>
              ))}
            </div>

            <div className={styles.section}>
              <h2>Documentos Requeridos</h2>
              {Object.keys(files).map((k) => (
                <div className={styles.formGroup} key={k}>
                  <label>{k.replaceAll("_", " ")}:</label>
                  <input type="file" name={k} onChange={handleFileChange} />
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <button type="submit" disabled={isLoadingDocs}>
                {isLoadingDocs ? "Subiendo..." : "🚀 Finalizar"}
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

        {/* ================= ADMIN & COMITÉ — LISTA ================= */}
        {(role === "admin" || role === "comite") && !documentData && (
          <div className={styles.section}>
            <h2>Solicitudes registradas</h2>

            {documentList.length === 0 ? (
              <p>No hay solicitudes.</p>
            ) : (
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
            )}
          </div>
        )}

        {/* ================= ADMIN & COMITÉ — DETALLE ================= */}
        {(role === "admin" || role === "comite") && documentData && (
          <div className={styles.section}>
            <h2>Solicitud #{documentData.id}</h2>

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
                    {key.replaceAll("_", " ")}
                  </label>

                  <div className={styles.actions}>
                    <button
                      onClick={() =>
                        window.open(
                          `${API_BASE}/documents/files/${documentData.id}/${key}`
                        )
                      }
                      disabled={!subido}
                    >
                      Ver
                    </button>

                    {role === "admin" && (
                      <>
                        <input type="file" name={key} onChange={handleFileChange} />
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
              onClick={() => {
                setDocumentData(null);
                setUploadedFiles([]);
              }}
            >
              ← Volver
            </button>
          </div>
        )}

        {mensaje && <p className={styles.message}>{mensaje}</p>}
      </section>
    </main>
  );
}
