// src/config/database.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { UserEntity } from "@/services/users/entity";
import { DocumentEntity } from "@/services/documents/entitiy";

dotenv.config();

const DB_TYPE = (process.env.DB_TYPE || "postgres").toLowerCase();

const commonOptions = {
  synchronize: true, // crear/actualizar tablas según entidades en dev
  dropSchema: false,
  logging: false,
  entities: [UserEntity, DocumentEntity],
};

let dataSourceOptions: any;

if (DB_TYPE === "mysql") {
  // Configuración para MySQL local (XAMPP)
  dataSourceOptions = {
    type: "mysql",
    host: process.env.HOST_DATA_BASE || "127.0.0.1",
    port: Number(process.env.PORT_DATA_BASE || "3306"),
    username: process.env.USER_DATA_BASE || "root",
    password: process.env.PASSWORD_DATA_BASE || "",
    database: process.env.NAME_DATA_BASE || "hackathon_db",
    extra: { connectionLimit: 10 },
    ...commonOptions,
  };
} else {
  // Por defecto: Postgres (Supabase)
  const useSSL = (process.env.DB_TLS ?? "").toLowerCase() !== "notls";
  dataSourceOptions = {
    type: "postgres",
    host: process.env.HOST_DATA_BASE,
    port: Number(process.env.PORT_DATA_BASE || "5432"),
    username: process.env.USER_DATA_BASE,
    password: process.env.PASSWORD_DATA_BASE,
    database: process.env.NAME_DATA_BASE,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    extra: { max: 10 },
    ...commonOptions,
  };
}

export const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
