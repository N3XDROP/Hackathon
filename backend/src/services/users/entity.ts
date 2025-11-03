import { IsEmail, Length } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { UserSchema } from "./schema";

/** 👇 Enum alineado con tu columna ENUM en Postgres */
export enum UserRole {
  admin = "1",
  user = "0",
  comite = "2",
}

@Entity({ name: "user_entity" })
export class UserEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ name: "email", length: 150, unique: true })
  @IsEmail()
  email!: string;

  @Column({ name: "name", length: 150 })
  name!: string;

  /** 👇 Usa type: 'enum' y mapea a UserRole */
  @Column({ name: "role", type: "enum", enum: UserRole, default: UserRole.user })
  role!: UserRole;

  @Length(8)
  @Column({ name: "password", length: 150 })
  password!: string;

  @Column({ name: "reset_token", nullable: true, default: "" })
  resetToken!: string;

  @Column({ name: "refresh_token", nullable: true, default: "" })
  refreshToken!: string;

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (!this.password) return;
    const alreadyHashed =
      typeof this.password === "string" && this.password.startsWith("$2");
    if (alreadyHashed) return;

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  static validate(input: Partial<UserEntity>) {
    return UserSchema.parse(input);
  }
}

export default UserEntity;
