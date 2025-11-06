// backend/src/app.ts
import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import path from "path";
import rateLimit from 'express-rate-limit';
import passport from "./passport";
import { AppDataSource } from "./config/database";
import authRoutes from "./routes/auth";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SESSION_SECRET', 'SSO_JWT_SECRET', 'FRONTEND_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Create Express app
const app = express();

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply middlewares
app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Types and Interfaces
interface User {
  id: string | number;
  email: string;
  role: 'admin' | 'user' | 'comite';
}

interface Service {
  id: string;
  title: string;
  text: string;
  img: string;
}

// Utility functions
const makeJti = (): string => crypto.randomUUID();

const createToken = (user: User): string => {
  const payload = {
    sub: String(user.id),
    email: String(user.email),
    role: String(user.role)
  };

  return jwt.sign(payload, process.env.SSO_JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: "1h",
    issuer: "hackaton-backend",
    audience: "flask-chat",
    jwtid: makeJti(),
  });
};

// Types for request bodies
interface LoginRequest {
  email: string;
  password: string;
}

// Route handlers
const handleIndex: express.RequestHandler = (_req, res) => {
  res.send("API Hackaton funcionando correctamente 🚀");
};

const handleLogin: express.RequestHandler = (req, res, next) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    res.status(400).json({
      ok: false,
      message: "Email y password son requeridos",
    });
    return;
  }

  passport.authenticate(
    "local",
    (err: Error | null, user: User | false, info: any) => {
      if (err) return next(err);
      if (!user) {
        res.status(401).json({ ok: false, message: info?.message || "Credenciales incorrectas" });
        return;
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);

        try {
          const token = createToken(user as User);
          const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
          const redirect = `${baseUrl}/chat-template?token=${encodeURIComponent(token)}`;
          res.json({ ok: true, redirect });
        } catch (e: any) {
          console.error("💥 Error en el proceso de login:", e?.name, e?.message);
          res.status(500).json({
            ok: false,
            message: "Error en el proceso de autenticación",
            code: e?.name || "AuthError",
          });
        }
      });
    }
  )(req, res, next);
};

const handleLogout: express.RequestHandler = (req, res) => {
  const redirect = (req.query.redirect as string) || process.env.FRONTEND_URL!;

  req.logout((err) => {
    if (err) {
      console.error("Error en logout:", err);
      res.redirect(redirect);
      return;
    }
    
    if (req.session) {
      req.session.destroy(() => {
        res.clearCookie("connect.sid", { path: "/" });
        res.redirect(redirect);
      });
    } else {
      res.redirect(redirect);
    }
  });
};

// Services routes
import servicesData from "./data/portafolio.json";
const services: Service[] = Array.isArray(servicesData) 
  ? servicesData 
  : (servicesData as any).services ?? [];

const handleGetServices: express.RequestHandler = (_req, res) => {
  res.json(services.map(({ id, title, text, img }) => ({ id, title, text, img })));
};

const handleGetServiceById: express.RequestHandler = (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) {
    res.status(404).json({ error: "Servicio no encontrado" });
    return;
  }
  res.json(service);
};

// Serve the chat template (static HTML) kept in `chat/templates` so the UI
// can be independent from the AI service. Exposed at /chat-template.
app.get('/chat-template', (req: Request, res: Response) => {
  const filePath = path.join(__dirname, '..', '..', 'chat', 'templates', 'index.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Failed to send chat template:', err);
      res.status(500).send('Error loading template');
    }
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Error handler middleware
const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({
    ok: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
};

// Mount routes
app.get("/", handleIndex);
app.post("/login", handleLogin);
app.get("/logout", handleLogout);
app.get("/api/services", handleGetServices);
app.get("/api/services/:id", handleGetServiceById);
app.use("/api/auth", authRoutes);

// Servir archivos subidos
app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));

// Apply error handler
app.use(errorHandler);

// Server startup
export const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("📦 Conexión con la base de datos establecida");

    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });

    // Handle uncaught errors
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error("❌ Error al iniciar la app:", error);
    process.exit(1);
  }
};

export default app;