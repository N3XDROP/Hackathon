import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { AppDataSource } from "./config/database";
import { UserEntity } from "./services/users/entity";
import bcrypt from "bcryptjs";

passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const user = await AppDataSource.getRepository(UserEntity).findOneBy({ email });

            console.log("🔍 Usuario encontrado en la DB:", user); // Verificar si se encuentra el usuario


            if (!user || !bcrypt.compareSync(password, user.password)) {

                return done(null, false, { message: "❌ Credenciales incorrectas" });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    })
);


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await AppDataSource.getRepository(UserEntity).findOneBy({ id });

        if (!user) {
            return done(new Error("Usuario no encontrado"), null);
        }

        done(null, user);
    } catch (error) {
        done(error, null);
    }
});



export default passport;
