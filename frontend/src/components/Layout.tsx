import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "./Layout.module.css";

interface LayoutProps {
  container?: boolean;
  children: React.ReactNode;
}

export default function Layout({ container = false, children }: LayoutProps) {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id="main" className={container ? "container" : undefined} role="main">
        {children}
      </main>

      <Footer />
    </>
  );
}
