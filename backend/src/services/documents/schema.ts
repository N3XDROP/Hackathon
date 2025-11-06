import { z } from "zod";

export const DocumentSchema = z.object({
  descripcionEntidad: z.string().optional(),
  tipoEntidad: z.string().optional(),
  objetoSocial: z.string().optional(),
  direccionFisica: z.string().optional(),
  residenciaBoyaca: z.string().optional(),
  rutSubido: z.boolean().default(false),
  camaraComercioSubido: z.boolean().default(false),
  cedulaSubido: z.boolean().default(false),
  cartaIntencionSubido: z.boolean().default(false),
  cartaAceptacionSubido: z.boolean().default(false),
  antecedentesContraloriaSubido: z.boolean().default(false),
  antecedentesProcuraduriaSubido: z.boolean().default(false),
  antecedentesPoliciaSubido: z.boolean().default(false),
  antecedentesRnmcSubido: z.boolean().default(false),
});