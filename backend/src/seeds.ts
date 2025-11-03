import { AppDataSource } from "./config/database"; // ✅ usa relativo si no tienes alias @
import { UserEntity, UserRole } from "./services/users/entity";
import * as bcrypt from "bcrypt";

export async function seedNewAdmin() {
  const repo = AppDataSource.getRepository(UserEntity);

  // Mejor que count(): evita crear si ya existe ese email
  const exists = await repo.findOne({ where: { email: "admin@gmail.com" } });
  if (exists) {
    console.log("ℹ️ Admin ya existe, no se crea otro.");
    return;
  }

  // Crea la entidad con tipado correcto
  const admin = repo.create({
    email: "admin@gmail.com",
    name: "José Luis Torres",
    password: await bcrypt.hash("12345678", 10),
    role: UserRole.admin,   // ✅ ENUM string ("admin")
    // resetToken y refreshToken tienen default "", no son necesarios aquí
  });

  await repo.save(admin);
  console.log("✅ Nuevo Admin Creado");
}
