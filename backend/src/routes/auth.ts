import { Router, type RequestHandler } from "express";
import { AppDataSource } from "../config/database";
import { UserEntity, UserRole } from "../services/users/entity";

const router = Router();

const register: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    res.status(400).json({ ok: false, message: "Todos los campos son obligatorios." });
    return;
  }

  try {
    const repo = AppDataSource.getRepository(UserEntity);
    const exists = await repo.findOne({ where: { email } });
    if (exists) {
      res.status(409).json({ ok: false, message: "El correo ya está registrado." });
      return;
    }

    const user = repo.create({ name, email, password, role: UserRole.user });
    await repo.save(user);

    res.json({ ok: true, message: "Usuario creado correctamente." });
  } catch (e) {
    console.error("Error en registro:", e);
    res.status(500).json({ ok: false, message: "Error al registrar usuario." });
  }
};

router.get("/test", (_req, res) => {
  res.json({ message: "Auth route working" });
});

router.post("/register", register);

export default router;
