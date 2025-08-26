import { useEffect, useState } from "react";

function App() {
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost:4000/") // Ajusta el puerto según tu backend
            .then(response => response.text()) // Si el backend envía texto plano
            .then(data => setMensaje(data))
            .catch(error => console.error("Error al obtener datos", error));
    }, []);

    return <h1>{mensaje}</h1>;
}

export default App;
