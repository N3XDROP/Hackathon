import { z } from "zod";
import { DocumentStatus } from "./entitiy";

export const DocumentSchema = z.object({
  userId: z.number().int(),
  descripcionEntidad: z.string().optional(),
  tipoEntidad: z.string().optional(),
  objetoSocial: z.string().optional(),

  rut: z.string().optional(),
  rutSubido: z.boolean().default(false),

  camaraComercio: z.string().optional(),
  camaraComercioSubido: z.boolean().default(false),

  cedula: z.string().optional(),
  cedulaSubido: z.boolean().default(false),

  cartaIntencion: z.string().optional(),
  cartaIntencionSubido: z.boolean().default(false),

  cartaAceptacion: z.string().optional(),
  cartaAceptacionSubido: z.boolean().default(false),

  antecedentesContraloria: z.string().optional(),
  antecedentesContraloriaSubido: z.boolean().default(false),

  antecedentesProcuraduria: z.string().optional(),
  antecedentesProcuraduriaSubido: z.boolean().default(false),

  antecedentesPolicia: z.string().optional(),
  antecedentesPoliciaSubido: z.boolean().default(false),

  antecedentesRnmc: z.string().optional(),
  antecedentesRnmcSubido: z.boolean().default(false),

  direccionFisica: z.string().optional(),
  residenciaBoyaca: z.string().optional(),

  estado: z.nativeEnum(DocumentStatus).default(DocumentStatus.EN_ESPERA),
});