import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Login from "./components/Login/login";
import App from "./App";
import Nosotros from "./pages/Nosotros";
import Aliados from "./pages/Aliados";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/servicios/:serviceId" element={<ServiceDetail />} />
          <Route path="/api-test" element={<App />} />
          <Route path="/quienes-somos" element={<Nosotros />}/>
            <Route path="/aliados" element={<Aliados />}/>
          <Route path="*" element={<div style={{padding:24}}>404 - Página no encontrada</div>} />

        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
