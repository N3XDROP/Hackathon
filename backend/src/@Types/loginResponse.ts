export interface LoginResponse {
  ok?: boolean;
  user: {
    id: number;
    name?: string;
    email: string;
  };
  role: string; // "usuario" | "admin" | "comite"
}
