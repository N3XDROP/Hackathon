import { useState } from "react";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");

    const handleLogin = async () => {
        // ✅ VALIDACIÓN: No permitir campos vacíos
        if (!email || !password) {
            setMensaje("⚠️ Completa todos los campos.");
            return;
        }

        // ✅ VALIDACIÓN: Formato de correo correcto
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMensaje("⚠️ Ingresa un correo válido.");
            return;
        }

        try {
            const response = await fetch("http://localhost:4000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            setMensaje(data.message);
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
