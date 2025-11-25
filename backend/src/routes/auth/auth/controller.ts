import { LoginResponse } from "@/@Types/loginResponse";
import { ServerConstants } from "@/constants";
import { createUserSchema, loginSchema } from "./schemas";
import { Roles } from "@/services/utils/enums";
import { UserEntity } from "@services/users/entity";
import { UserRepository } from "@services/users/repository";
import * as bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import "reflect-metadata";
import { EntityNotFoundError } from "typeorm";
import { ZodError } from "zod";
import * as jwt from "jsonwebtoken"

const JWTSECRET = ServerConstants.JWTSECRET ?? "";
const JWTSECRETREFRESH = ServerConstants.JWTSECRETREFRESH ?? "";

interface JwtPayload {
	userId: number;
	email: string;
	role: number;
}
export class AuthController {

	private mapRole(role: string | number) {
		// role stored in DB: "0" = user, "1" = admin, "2" = comite
		const r = String(role);
		switch (r) {
			case "1":
				return "admin";
			case "2":
				return "comite";
			default:
				return "usuario";
		}
	}

	public async findAsociatedEntity(id: number, role: any, email: string): Promise<LoginResponse> {
		const userRepository = new UserRepository();
		const associated = await userRepository.findById(id).catch(() => null);

		// Return a sanitized user object (never send full entity)
		return {
			ok: true,
			user: {
				id,
				name: (associated && (associated as any).name) || undefined,
				email,
			},
			role: this.mapRole(role),
		};
	}

	private generateTokens(payload: string | object): { token: string; refreshToken: string } {
		return {
			token: jwt.sign(payload, JWTSECRET, { expiresIn: "24h" }),
			refreshToken: jwt.sign(payload, JWTSECRETREFRESH, { expiresIn: "7d" }),
		};
	}

	private async validateUser(email: string, password: string): Promise<UserEntity> {
		const userRepository = new UserRepository();
		const user = await userRepository.findByEmail(email);
		if (!user) {
			throw new Error("User not found");
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			throw new Error("Invalid credentials");
		}
		return user;
	}


	private verifyToken(token: string, secret: string): unknown {
		try {
			return jwt.verify(token, secret);
		} catch (error) {
			throw new Error("Invalid or expired token");
		}
	}

	public login = async (req: Request, res: Response): Promise<void> => {
		try {
			const { email, password } = loginSchema.parse(req.body);

			const user = await this.validateUser(email, password);
			console.log("🔍 DEBUG - user.role tipo:", typeof user.role, "valor:", user.role);
			
			// Asegurar que el role sea string
			const roleStr = String(user.role);
			const payload = {
				sub: user.id,
				email: user.email,
				name: user.name,
				role: roleStr, // store numeric-as-string in token
			};
			console.log("🔍 DEBUG - payload:", payload);
			
			const { token, refreshToken } = this.generateTokens(payload);

			user.refreshToken = refreshToken;
			const loginResponse = await this.findAsociatedEntity(user.id, user.role, user.email);

			// Normalize response: include mapped role and sanitized user
			const responseWithRole = {
				...loginResponse,
				role: this.mapRole(roleStr),
				token,
			};

			console.log("📤 DEBUG - Response:", responseWithRole);

			res
				.status(200)
				.cookie("token", token, {
					httpOnly: true,
					secure: true,
					sameSite: "none",
					domain: ".duarfit.com", // aplica para duarfit.com y api.duarfit.com
					path: "/",
					expires: new Date(Date.now() + 3600000),
				})
				.json(responseWithRole);

		} catch (error) {
			if (error instanceof ZodError) {
				const errorMessage = error.errors?.[0]?.message || "Datos inválidos";
				res.status(400).json({ message: errorMessage });
				return;
			}
			if (error instanceof Error && error.message === "Invalid credentials") {
				res.status(401).json({ message: "Credenciales inválidas" });
				return;
			}
			if (error instanceof EntityNotFoundError) {
				res.status(401).json({ message: "Usuario no encontrado" });
				return;
			}
			console.error(error);
			res.status(401).json({ message: "Ocurrió un error al intentar iniciar sesión" });
		}

	};

	public logout = async (req: Request, res: Response): Promise<void> => {
		if (req.cookies.token) {
			res.status(200).clearCookie("token").json({ message: "Sesión cerrada correctamente" });
		} else {
			res.status(401).json({ message: "Token no encontrado" });
		}
	}


	public refreshToken = async (req: Request, res: Response): Promise<void> => {
		const refreshToken = (req.body?.token || req.params.refresh) as string;

		if (!refreshToken) {
			res.status(400).json({ message: "Token de actualización requerido" });
			return;
		}

		const userRepository = new UserRepository();

		try {
			const decoded = this.verifyToken(refreshToken, JWTSECRETREFRESH) as any;
			const email = decoded.email || decoded.sub;
			const user = await userRepository.findByEmail(email);

			if (!user) {
				res.status(404).json({ message: "Usuario no encontrado" });
				return;
			}

			const newPayload = { sub: user.id, email: user.email, role: user.role };
			const newAccessToken = jwt.sign(newPayload, JWTSECRET, { expiresIn: "24h" });

			res
				.status(200)
				.cookie("token", newAccessToken, {
					httpOnly: true,
					secure: true,
					sameSite: "none",
					path: "/",
					expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
				})
				.json({ message: "OK", token: newAccessToken });

		} catch (error) {
			res.status(401).json({ message: "Token inválido o expirado" });
		}
	};


	public createUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const { email, name, password, role } = createUserSchema.parse(req.body);
			const userRepository = new UserRepository();

			const existingUser = await userRepository.findByEmail(email);
			if (existingUser) {
				res.status(409).json({ message: "El usuario ya existe" });
				return;
			}

			const newUser = new UserEntity();
			newUser.email = email;
			newUser.name = name;
			newUser.password = password;
			newUser.role = role as any;

			const savedUser = await userRepository.save(newUser);
			res.status(201).json(savedUser);
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Ocurrió un error al crear el usuario" });
		}
	};


}