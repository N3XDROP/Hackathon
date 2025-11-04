import { useState } from "react";
import styles from "./documents.module.css";

export default function Documents() {
  // TODO: reemplazar este estado por el rol real del usuario desde el backend
  const [role, setRole] = useState<"usuario" | "admin" | "comite">("usuario");

  // TODO: traer los datos reales del usuario autenticado
  const username = "Usuario Demo";

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        {/* Encabezado con información del usuario */}
        <header className={styles.header}>
          <h1 className={styles.title}>Panel de Documentos</h1>
          <p className={styles.subtitle}>
            Bienvenido, <strong>{username}</strong>
          </p>

          {/* Selector temporal de rol (solo para pruebas locales) */}
          <div className={styles.roleSelect}>
            <label>Cambiar rol:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="comite">Comité</option>
            </select>
          </div>
        </header>

        {/* ---------------------- VISTA USUARIO ---------------------- */}
        {role === "usuario" && (
          <form
            className={styles.form}
            // TODO: reemplazar acción de subida por llamada a tu backend Flask
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Subir documentos");
            }}
          >
            {/* Información de la Entidad */}
            <div className={styles.section}>
              <h2>Información de la Entidad</h2>
              <div className={styles.formGroup}>
                <label>
                  Descripción de la entidad (misión, visión, actividades TIC):
                </label>
                <textarea
                  name="descripcion_entidad"
                  placeholder="Describe la misión, visión y actividades relacionadas con TIC de tu entidad..."
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>Tipo de entidad (natural o jurídica):</label>
                <input
                  type="text"
                  name="tipo_entidad"
                  placeholder="Ej: Persona jurídica, Persona natural"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Objeto social relacionado con TIC:</label>
                <input
                  type="text"
                  name="objeto_social"
                  placeholder="Describe el objeto social relacionado con tecnología"
                />
              </div>
            </div>

            {/* Documentos Requeridos */}
            <div className={styles.section}>
              <h2>Documentos Requeridos</h2>
              <div className={styles.formGroup}>
                <label>RUT actualizado:</label>
                <input type="file" name="rut" accept=".pdf,.png,.jpg,.jpeg" />
              </div>
              <div className={styles.formGroup}>
                <label>Certificado de Cámara de Comercio (vigente):</label>
                <input
                  type="file"
                  name="camara_comercio"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Cédula del representante legal:</label>
                <input
                  type="file"
                  name="cedula"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            </div>

            {/* Documentos Firmados */}
            <div className={styles.section}>
              <h2>Documentos Firmados</h2>
              <div className={styles.formGroup}>
                <label>Carta de Intención de Afiliación (firmada):</label>
                <input
                  type="file"
                  name="carta_intencion"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Carta de Aceptación de Estatutos, Reglamentos Internos y
                  Políticas (firmada):
                </label>
                <input
                  type="file"
                  name="carta_aceptacion"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            </div>

            {/* Antecedentes del Representante */}
            <div className={styles.section}>
              <h2>Antecedentes del Representante Legal</h2>
              <div className={styles.formGroup}>
                <label>Antecedentes Contraloría:</label>
                <input
                  type="file"
                  name="antecedentes_contraloria"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Antecedentes Procuraduría:</label>
                <input
                  type="file"
                  name="antecedentes_procuraduria"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Antecedentes Policía:</label>
                <input
                  type="file"
                  name="antecedentes_policia"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Antecedentes RNMC:</label>
                <input
                  type="file"
                  name="antecedentes_rnmc"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            </div>

            {/* Información Adicional */}
            <div className={styles.section}>
              <h2>Información Adicional</h2>
              <div className={styles.formGroup}>
                <label>Dirección física:</label>
                <input
                  type="text"
                  name="direccion_fisica"
                  placeholder="Dirección completa de la entidad"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Residencia en Boyacá:</label>
                <input
                  type="text"
                  name="residencia_boyaca"
                  placeholder="Información sobre residencia en Boyacá"
                />
              </div>
            </div>

            <button type="submit">
              🚀 Analizar Documentos con IA
            </button>
          </form>
        )}

        {/* ---------------------- VISTA ADMIN ---------------------- */}
        {role === "admin" && (
          <div className={styles.section}>
            <h2>Gestión de Documentos</h2>
            <p>Consulta los documentos enviados por los usuarios.</p>
            {/* TODO: Mapear documentos del backend */}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>juanperez@mail.com</td>
                  <td>InformeAnual.pdf</td>
                  <td>2025-11-04</td>
                  <td>
                    <button>Ver</button>
                    <button>Eliminar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------------- VISTA COMITÉ ---------------------- */}
        {role === "comite" && (
          <div className={styles.section}>
            <h2>Revisión del Comité</h2>
            <p>
              Revisa, aprueba o rechaza los documentos subidos por los usuarios.
            </p>

            {/* TODO: Mapear documentos asignados al comité */}
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Tipo de Documento</th>
                  <th>Archivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>andres@mail.com</td>
                  <td>RUT actualizado</td>
                  <td>
                    <button>Ver PDF</button>
                  </td>
                  <td>En revisión</td>
                  <td className={styles.actions}>
                    <button>Aprobar</button>
                    <button>Rechazar</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}