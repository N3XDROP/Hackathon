import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import Layout from "./components/Layout";
import Home from "./pages/Home";
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
          <Route path="/api-test" element={<App />} />
          <Route path="/quienes-somos" element={<Nosotros />}/>
            <Route path="/aliados" element={<Aliados />}/>
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
