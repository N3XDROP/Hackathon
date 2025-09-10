import { UserEntity } from "@/services/users/entity";
import { DataSource } from "typeorm";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST_DATA_BASE,
    port: Number.parseInt(process.env.PORT_DATA_BASE || "5432"),
    username: process.env.USER_DATA_BASE,
    password: process.env.PASSWORD_DATA_BASE,
    database: process.env.NAME_DATA_BASE,
    ssl: {
        rejectUnauthorized: false,
    },
    extra: {
        max: 10,
    },
    synchronize: false,
    logging: false,
    dropSchema: false,
    entities: [
        UserEntity
    ],
});
