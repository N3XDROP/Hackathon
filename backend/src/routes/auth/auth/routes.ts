import { Router } from "express";
import { AuthController } from "./controller";

export class AuthRoutes {
	private authController = new AuthController();
	private router: Router;

	constructor() {
		this.router = Router();
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.route("/login").post(this.authController.login);
		this.router.route("/logout").post(this.authController.logout);
		this.router.route("/createUser").post(this.authController.createUser);
		this.router.route("/refreshToken").post(this.authController.refreshToken);
	}

	public routes(): Router {
		return this.router;
	}
}
