import { AppDataSource } from "@/config/database";
import { UserEntity } from "./services/users/entity";
import * as bcrypt from 'bcrypt';

export async function seedNewAdmin() {
	const repository = AppDataSource.getRepository(UserEntity);
	const count = await repository.count();
	if (count === 0) {
		await repository.save({
			email: "admin@gmail.com",
			name: "José Luis Torres",
			password: await bcrypt.hash("12345678", 10),
			role: 0
			
    });
	}
	console.log("Nuevo Admin Creado");
}