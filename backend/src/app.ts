import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./passport";
import { AppDataSource } from "./config/database";
import "dotenv/config"; // <-- carga .env
import "dotenv/config";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs"; // Importamos bcrypt
import { User } from "@supabase/supabase-js";
import type { Request, Response } from "express";

dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Configuración de sesión
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Ruta básica de prueba
app.get("/", (req, res) => {
  res.send("API Hackaton funcionando correctamente 🚀");
});

function makeJti() {
  // @ts-ignore
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

app.get("/logout", (req: Request, res: Response) => {
  const redirect =
    (req.query.redirect as string) ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173";

  // passport 0.6+: req.logout requiere callback
  req.logout((err) => {
    if (err) {
      console.error("logout error:", err);
      return res.redirect(redirect);
    }

    // destruye session de express-session
    if (req.session) {
      req.session.destroy(() => {
        // borra cookie de sesión (por defecto connect.sid)
        res.clearCookie("connect.sid", { path: "/" });
        return res.redirect(redirect);
      });
    } else {
      return res.redirect(redirect);
    }
  });
});

app.post("/login", (req, res, next) => {
  console.log("🔍 Datos recibidos en el backend:", req.body);

  passport.authenticate("local", (err: Error | null, user: any | false) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ ok: false, message: "❌ Credenciales incorrectas" });

    req.login(user, (err) => {
      if (err) return next(err);

      try {
        const secret = process.env.SSO_JWT_SECRET;
        if (!secret) {
          console.error("❗ Falta SSO_JWT_SECRET (.env no cargado?)");
          throw new Error("SSO_JWT_SECRET missing");
        }

        const payload = {
          sub: String(user.id),
          email: String(user.email || ""),
          role: Number(user.role ?? 1), // 0=admin,1=user,2=comite
        };

        if (process.env.NODE_ENV !== "production") {
          console.log("🔑 Firmando JWT con payload:", payload);
        }

        const token = jwt.sign(payload, secret, {
          algorithm: "HS256",
          expiresIn: "60s",
          issuer: "hackaton-backend",
          audience: "flask-chat",
          jwtid: makeJti(),
        });

        const flask = process.env.FLASK_CHAT_URL || "http://localhost:5000";
        const redirect = `${flask}/auth/consume?token=${encodeURIComponent(
          token
        )}`;

        return res.json({ ok: true, redirect });
      } catch (e: any) {
        console.error("💥 Error generando token:", e?.name, e?.message);
        return res
          .status(500)
          .json({
            ok: false,
            message: "Error generando token",
            code: e?.name || "TokenError",
          });
      }
    });
  })(req, res, next);
});

// **Ruta protegida para administración**
app.get("/admin", (req, res) => {
  if (req.isAuthenticated()) {
    res.send("Panel del administrador 🛠️");
  } else {
    res.status(401).send("❌ Debes iniciar sesión para acceder al panel");
  }
});

// ✅ Importa el JSON
import raw from "./data/portafolio.json";

type Service = {
  id: string;
  title: string;
  text: string;
  img: string;
};

const services: Service[] = Array.isArray(raw)
  ? (raw as Service[])
  : ((raw as any).services as Service[]) ?? [];

// GET /api/services → solo resumen para la lista
app.get("/api/services", (_req, res) => {
  const resumen = services.map(({ id, title, text, img }) => ({
    id,
    title,
    text,
    img,
  }));
  res.json(resumen);
});

// GET /api/services/:id → detalle completo
app.get("/api/services/:id", (req: any, res: any) => {
  const service = services.find((s) => s.id === req.params.id);
  if (!service)
    return res.status(404).json({ error: "Servicio no encontrado" });
  res.json(service);
});

// ✅ **Conexión a la base de datos y arranque del servidor**
export const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("📦 Conexión con la base de datos establecida");

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar la app:", error);
  }
};

export default app;
