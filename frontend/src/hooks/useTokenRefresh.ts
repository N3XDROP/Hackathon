import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook para refrescar automáticamente el token JWT antes de que expire
 * Refresca el token cada 12 horas (si la sesión está activa)
 */
export const useTokenRefresh = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getTokenFromLocalStorage = () => {
      return localStorage.getItem("token");
    };

    const refreshToken = async () => {
      const token = getTokenFromLocalStorage();

      // Solo intentar refrescar si hay token disponible
      if (!token) return;

      try {
        // Refrescar el token
        const response = await fetch("http://localhost:4000/api/auth/refreshToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          console.log("Token expirado");
          // No redirigir automáticamente aquí, dejar que el usuario lo note
          return;
        }

        const data = await response.json();
        if (data.token) {
          // Actualizar el token en localStorage
          localStorage.setItem("token", data.token);
          console.log("✅ Token refrescado exitosamente");
        }
      } catch (error) {
        console.error("Error al refrescar token:", error);
      }
    };

    // Refrescar cada 12 horas (43200000 ms)
    const interval = setInterval(refreshToken, 12 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);
};
