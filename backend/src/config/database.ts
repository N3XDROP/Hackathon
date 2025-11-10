// src/config/database.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

import { UserEntity } from "../services/users/entity";


dotenv.config();

const useSSL = (process.env.DB_TLS ?? "").toLowerCase() !== "notls";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.HOST_DATA_BASE,
  port: Number(process.env.PORT_DATA_BASE || "5432"),
  username: process.env.USER_DATA_BASE,
  password: process.env.PASSWORD_DATA_BASE,
  database: process.env.NAME_DATA_BASE,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  extra: { max: 10 },

  /**
   * 👇 Para desarrollo con `npm run dev`
   * - synchronize: crea/actualiza tablas a partir de las entidades.
   * - dropSchema: en false para NO borrar tus datos cada vez que arranca.
   */
  synchronize: true,
  dropSchema: false,
  logging: false,

  entities: [UserEntity],
});

export default AppDataSource;
