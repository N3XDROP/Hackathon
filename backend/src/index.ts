import "reflect-metadata";
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { ServerConstants } from "./constants";
import app from "./app";
import { seedNewAdmin } from "./seeds";

dotenv.config();

AppDataSource.initialize()
	.then(async () => {
		console.clear();

		await seedNewAdmin();

		app.listen(ServerConstants.PORT, () => {
			console.log(`🚀 Server is running on port ${ServerConstants.PORT}`);
		});
		console.log("📦 Data Source has been initialized!");
	})
	.catch((error) => {
		console.log("❌ Error during Data Source initialization:", error);
	});
