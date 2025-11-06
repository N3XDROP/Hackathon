import { Router, Request, Response } from "express";
import { AppDataSource } from "@/config/database";
import { UserEntity, UserRole } from "@/services/users/entity";
import { DocumentEntity, DocumentStatus } from "@/services/documents/entitiy";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

// 📁 Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const baseDir = path.join(__dirname, "..", "..", "uploads");
    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
    cb(null, baseDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${sanitized}`);
  },
});
const upload = multer({ storage });

// 🟩 Crear documento
const createDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, descripcionEntidad, tipoEntidad, objetoSocial, direccionFisica, residenciaBoyaca } = req.body;

    const userRepo = AppDataSource.getRepository(UserEntity);
    const user = await userRepo.findOne({ where: { id: Number(userId) } });
    if (!user) {
      res.status(404).json({ ok: false, message: "Usuario no encontrado." });
      return;
    }

    const docRepo = AppDataSource.getRepository(DocumentEntity);
    let existingDoc = await docRepo.findOne({ where: { userId: user.id } });

    if (!existingDoc) {
      existingDoc = docRepo.create({
        user,
        userId: user.id,
        descripcionEntidad,
        tipoEntidad,
        objetoSocial,
        direccionFisica,
        residenciaBoyaca,
        estado: DocumentStatus.EN_ESPERA,
      });
      await docRepo.save(existingDoc);

      // Crear carpeta para este documento
      const dir = path.join(__dirname, "..", "..", "uploads", String(existingDoc.id));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }

    res.json({ ok: true, document: existingDoc });
  } catch (error) {
    console.error("Error al crear documento:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor." });
  }
};

// 📂 Listar archivos subidos para un documento
router.get("/files/:docId", (req: Request, res: Response): void => {
  const { docId } = req.params;
  const dir = path.join(__dirname, "..", "..", "uploads", docId);

  if (!fs.existsSync(dir)) {
    res.json({ files: [] });
    return;
  }

  const files = fs.readdirSync(dir);
  res.json({ files });
});

// ✅ Actualizar estado del documento (aprobado / rechazado)
router.put("/status/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const repo = AppDataSource.getRepository(DocumentEntity);
    const document = await repo.findOne({ where: { id: Number(id) } });

    if (!document) {
      res.status(404).json({ message: "Documento no encontrado." });
      return;
    }

    document.estado = status;
    await repo.save(document);
    res.json({ message: `Estado actualizado a ${status}.`, document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar estado." });
  }
});

// 🟩 Obtener todas las solicitudes (para admin o comité)
router.get("/all", async (req: Request, res: Response): Promise<void> => {
  try {
    const repo = AppDataSource.getRepository(DocumentEntity);
    const docs = await repo.find();
    res.json({ ok: true, documents: docs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error al obtener documentos." });
  }
});

// 📂 Nueva ruta: servir archivo por campo
router.get("/files/:docId/:field", (req: Request, res: Response) => {
  const { docId, field } = req.params;
  const dir = path.join(__dirname, "..", "..", "uploads", docId);

  if (!fs.existsSync(dir)) {
    res.status(404).send("Directorio no encontrado.");
    return;
  }

  const files = fs.readdirSync(dir);
  const match = files.find((f) => f.startsWith(field)); // busca rut.*, cedula.*, etc.

  if (!match) {
    res.status(404).send("Archivo no encontrado.");
    return;
  }

  const filePath = path.join(dir, match);
  res.sendFile(filePath);
});

// 🟦 Subir archivo (usuario o admin)
router.post("/upload/:docId", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  const { docId } = req.params;
  const file = req.file;
  const field = req.body.field;

  if (!file || !field) {
    res.status(400).json({ ok: false, message: "Archivo o campo no especificado." });
    return;
  }

  try {
    const repo = AppDataSource.getRepository(DocumentEntity);
    const document = await repo.findOne({ where: { id: Number(docId) } });
    if (!document) {
      res.status(404).json({ ok: false, message: "Documento no encontrado." });
      return;
    }

    const targetDir = path.join(__dirname, "..", "..", "uploads", String(document.id));
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // Guardar con el nombre del campo y misma extensión
    const extension = path.extname(file.originalname);
    const targetPath = path.join(targetDir, `${field}${extension}`);

    // Si ya existe, eliminarlo para reemplazar
    if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);

    fs.renameSync(file.path, targetPath);

    const fieldName = `${field}Subido` as keyof DocumentEntity;
    if (Object.prototype.hasOwnProperty.call(document, fieldName)) {
      (document[fieldName] as boolean) = true;
    }

    await repo.save(document);
    res.json({ ok: true, message: `Archivo '${field}' guardado como ${field}${extension}.` });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).json({ ok: false, message: "Error interno al subir archivo." });
  }
});

// 🟧 Admin: subir o reemplazar archivos
router.post("/admin/upload/:docId", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  const { docId } = req.params;
  const file = req.file;
  const field = req.body.field;

  if (!file || !field) {
    res.status(400).json({ ok: false, message: "Archivo o campo no especificado." });
    return;
  }

  try {
    const repo = AppDataSource.getRepository(DocumentEntity);
    const document = await repo.findOne({ where: { id: Number(docId) } });
    if (!document) {
      res.status(404).json({ ok: false, message: "Documento no encontrado." });
      return;
    }

    const dir = path.join(__dirname, "..", "..", "uploads", String(document.id));
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const extension = path.extname(file.originalname);
    const destPath = path.join(dir, `${field}${extension}`);

    // Eliminar antiguo si existe
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);

    fs.renameSync(file.path, destPath);

    const fieldName = `${field}Subido` as keyof DocumentEntity;
    if (Object.prototype.hasOwnProperty.call(document, fieldName)) {
      (document[fieldName] as boolean) = true;
    }

    await repo.save(document);
    res.json({ ok: true, message: `Archivo '${field}' actualizado correctamente.` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error al agregar archivo." });
  }
});

router.delete("/admin/delete/:docId", async (req: Request, res: Response): Promise<void> => {
  const { docId } = req.params;
  const { field } = req.body;
  try {
    const repo = AppDataSource.getRepository(DocumentEntity);
    const document = await repo.findOne({ where: { id: Number(docId) } });
    if (!document) {
      res.status(404).json({ ok: false, message: "Documento no encontrado." });
      return;
    }

    const dir = path.join(__dirname, "..", "..", "uploads", String(document.id));
    const files = fs.readdirSync(dir);
    const foundFile = files.find((f) => f.startsWith(field));
    if (foundFile) fs.unlinkSync(path.join(dir, foundFile));

    const fieldName = `${field}Subido` as keyof DocumentEntity;
    if (Object.prototype.hasOwnProperty.call(document, fieldName)) {
      (document[fieldName] as boolean) = false;
    }

    await repo.save(document);
    res.json({ ok: true, message: "Archivo eliminado por admin." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error al eliminar archivo." });
  }
});

// 🟨 Comité: aprobar/rechazar
const updateStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { docId } = req.params;
    const { status } = req.body;

    const repo = AppDataSource.getRepository(DocumentEntity);
    const document = await repo.findOne({ where: { id: Number(docId) } });
    if (!document) {
      res.status(404).json({ ok: false, message: "Documento no encontrado." });
      return;
    }

    if (![DocumentStatus.APROBADO, DocumentStatus.RECHAZADO].includes(status)) {
      res.status(400).json({ ok: false, message: "Estado inválido." });
      return;
    }

    document.estado = status;
    await repo.save(document);
    res.json({ ok: true, message: "Estado actualizado.", document });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error al actualizar estado." });
  }
};

// 🟦 Obtener documentos
const getDocumentsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const repo = AppDataSource.getRepository(DocumentEntity);
    const docs = await repo.find({ where: { userId: Number(userId) } });
    if (!docs.length) {
      res.status(404).json({ ok: false, message: "No hay documentos." });
      return;
    }
    res.json({ ok: true, documents: docs });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error al obtener documentos." });
  }
};

// 🟩 Registro
const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ ok: false, message: "Campos incompletos." });
    return;
  }

  try {
    const repo = AppDataSource.getRepository(UserEntity);
    const exists = await repo.findOne({ where: { email } });
    if (exists) {
      res.status(409).json({ ok: false, message: "Correo ya registrado." });
      return;
    }

    const user = repo.create({ name, email, password, role: UserRole.user });
    await repo.save(user);
    res.json({ ok: true, message: "Usuario creado." });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error al registrar usuario." });
  }
};

// 🔗 Rutas
router.post("/register", register);
router.post("/create", createDocument);
router.get("/user/:userId", getDocumentsByUser);
router.put("/status/:docId", updateStatus);

export default router;