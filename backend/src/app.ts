import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./passport";
import { AppDataSource } from "./config/database";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true 
}));

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

// ✅ **RUTA LOGIN con Passport y verificación en la base de datos**
import bcrypt from "bcryptjs"; // Importamos bcrypt
import { User } from "@supabase/supabase-js";

app.post("/login", (req, res, next) => {
    console.log("🔍 Datos recibidos en el backend:", req.body);

    passport.authenticate("local", (err: Error | null, user: User | false) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: "❌ Credenciales incorrectas" });

        req.login(user, (err) => {
            if (err) return next(err);
            console.log("✅ Usuario autenticado:", user);
            res.json({ message: "✅ Inicio de sesión exitoso", user });
        });
    })(req, res, next);
});




// ✅ **Ruta protegida para administración**
app.get("/admin", (req, res) => {
    if (req.isAuthenticated()) {
        res.send("Panel del administrador 🛠️");
    } else {
        res.status(401).send("❌ Debes iniciar sesión para acceder al panel");
    }
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
