import { branding } from "../config/branding";

type Variant = "primary" | "alt" | "icon" | "clean";

interface LogoProps {
  variant?: Variant;        // versión del logo
  height?: number;          // alto máximo (px) - mantiene proporción
  className?: string;       // por si quieres aplicar clases externas
  alt?: string;             // override de texto alternativo
}

export default function Logo({
  variant = "primary",
  height = 40,
  className,
  alt,
}: LogoProps) {
  const src = branding.logos[variant];
  const altText = alt ?? `${branding.name} logo`;

  return (
    <img
      src={src}
      alt={altText}
      className={className}
      style={{ display: "block", maxHeight: height, width: "auto" }}
      loading="lazy"
      decoding="async"
    />
  );
}
