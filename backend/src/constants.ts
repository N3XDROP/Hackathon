import dotenv from "dotenv";

dotenv.config();

const PUBLIC_API = "/public";
const PRIVATE_API = "/private";

export const EndPoints = {
	PUBLIC_API,
	PRIVATE_API,
	USERS_API: `${PRIVATE_API}/users`
};

export const ServerConstants = {
	PORT: process.env.PORTAPP
};
