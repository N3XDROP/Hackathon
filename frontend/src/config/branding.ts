export const branding = {
  name: "Clúster SumerTIC",
  logos: {
    primary: "/logos/Logos_SUMERTICJPG_FondoBlanco.jpg",
    alt: "/logos/Logos_SUMERTICJPG_FondoVerdeClaro.jpg",
    icon: "/logos/Logos_SUMERTICJPG_FondoVerdeOscuro.jpg",
    clean: "/logos/Logo_Cluster_SinFondo.png",
  },
  nav: [
    { to: "/", label: "Inicio" },
    { to: "/quienes-somos", label: "Quiénes Somos" },
    { to: "/servicios", label: "Servicios" },
    { to: "/aliados", label: "Aliados" },
    { to: "/como-unirse", label: "Como unirse" },
  ],
  colors: {
    pri: "#01D37C",
    pri2: "#00D279",
    pri3: "#1DD78A",
    sec: "#015351",
    sec2: "#077F75",
    sec3: "#175F60",
    white: "#FFFFFF",
  },
} as const;
