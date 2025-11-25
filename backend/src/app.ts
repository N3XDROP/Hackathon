// backend/src/app.ts
import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import path from "path";
import rateLimit from 'express-rate-limit';
import { AppDataSource } from "./config/database";
import { AuthRoutes } from "./routes/auth/auth/routes";
import documentsRoutes from "./routes/documents";
import { ServerConstants } from "./constants";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SSO_JWT_SECRET', 'FRONTEND_URL'];
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
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Types and Interfaces
interface User {
  id: string | number;
  email: string;
  role: 'admin' | 'user' | 'comite';
}

// Middleware para verificar JWT
interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SSO_JWT_SECRET!) as JwtPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: "Token inválido o expirado" });
  }
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

// Services routes
import servicesData from "./data/portafolio.json";

interface Service {
  id: string;
  title: string;
  text: string;
  img: string;
}

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
const authRoutes = new AuthRoutes().routes();
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentsRoutes);

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
app.get("/api/services", handleGetServices);
app.get("/api/services/:id", handleGetServiceById);
app.use("/uploads", express.static(path.join(__dirname, "..", "..", "uploads")));

// Apply error handler
app.use(errorHandler);

// Server startup
export const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("📦 Conexión con la base de datos establecida");

    const PORT = ServerConstants.PORT;
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