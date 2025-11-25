import { Roles } from "@/services/utils/enums";
import { z } from "zod";

export const loginSchema = z.object({
	email: z.string({
		required_error: "El correo electrónico es requerido",
		invalid_type_error: "El correo electrónico debe ser una cadena de texto"
	}).email("El formato del correo electrónico no es válido"),
	password: z.string({
		required_error: "La contraseña es requerida",
		invalid_type_error: "La contraseña debe ser una cadena de texto"
	}).min(8, "La contraseña debe tener al menos 8 caracteres"),
}
);
export const createUserSchema = z.object({
	email: z.string({
		required_error: "El correo electrónico es requerido",
		invalid_type_error: "El correo electrónico debe ser una cadena de texto"
	}).email("El formato del correo electrónico no es válido"),
	name: z.string({
		required_error: "El nombre es requerido",
		invalid_type_error: "El nombre debe ser una cadena de texto"
	}),
	password: z.string({
		required_error: "La contraseña es requerida",
		invalid_type_error: "La contraseña debe ser una cadena de texto"
	}).min(8, "La contraseña debe tener al menos 8 caracteres"),
	role: z.nativeEnum(Roles, {
		required_error: "El rol es requerido",
		invalid_type_error: "El rol seleccionado no es válido"
	})
});