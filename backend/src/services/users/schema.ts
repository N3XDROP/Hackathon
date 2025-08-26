import { z } from "zod";

export const UserSchema = z.object({
	email: z.string().email().max(150),
    name: z.string().max(150),
	password: z.string().min(8).max(150),
	resetToken: z.string().optional().default(""),
	refreshToken: z.string().optional().default(""),
});
