import { useState } from "react";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

    const handleLogin = async () => {
        if (!email || !password) {
            setMensaje("⚠️ Completa todos los campos.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMensaje("⚠️ Ingresa un correo válido.");
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // por si mantienes sesión en backend también
            body: JSON.stringify({ email, password })
            });

            const data = await resp.json();
            setMensaje(data?.message || "");

            if (resp.ok && data?.ok && data?.redirect) {
            window.location.href = data.redirect; // 🔁 SSO hacia Flask
            } else {
            setMensaje(data?.message || "❌ Credenciales inválidas.");
            }
        } catch (error) {
            console.error("Error en el login", error);
            setMensaje("❌ Error al conectar con el servidor.");
        }
        };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Iniciar Sesión</h1>
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleLogin}>Ingresar</button>
                <p>{mensaje}</p>
            </div>
        </div>
    );
}

export default Login;
