import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { AppDataSource } from "./config/database";
import { UserEntity } from "./services/users/entity";
import bcrypt from "bcryptjs";

/** Repo helper */
const userRepo = () => AppDataSource.getRepository(UserEntity);

/** Normaliza lo que venga de la sesión a un id numérico */
function normalizeUserId(raw: unknown): number | null {
  try {
    if (typeof raw === "number") return raw;

    if (typeof raw === "string") {
      // ¿es un número?
      if (/^\d+$/.test(raw)) return parseInt(raw, 10);
      // ¿es un JSON con { id: ... }?
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.id !== "undefined") {
        return parseInt(String(parsed.id), 10);
      }
    }

    if (raw && typeof raw === "object" && "id" in (raw as any)) {
      return parseInt(String((raw as any).id), 10);
    }
  } catch {
    // ignorar parse errors
  }
  return null;
}

/** Estrategia local: email + password */
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const repo = userRepo();
        const user = await repo.findOne({ where: { email } });

        if (!user) {
          return done(null, false, { message: "❌ Credenciales incorrectas" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          return done(null, false, { message: "❌ Credenciales incorrectas" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/** ✅ Serializa SOLO el id (buena práctica) */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/** ✅ Deserializa tolerando sesiones antiguas (objeto completo o JSON string) */
passport.deserializeUser(async (raw: any, done) => {
  try {
    const id = normalizeUserId(raw);
    if (id == null || Number.isNaN(id)) {
      return done(null, false);
    }

    const repo = userRepo();
    const user = await repo.findOne({ where: { id } });

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
});

export default passport;
