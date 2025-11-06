import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import UserEntity from "../users/entity";

/** 👇 Enum para controlar el estado del proceso de aprobación */
export enum DocumentStatus {
  EN_ESPERA = "en_espera",
  REVISADO = "revisado",
  APROBADO = "aprobado",
  RECHAZADO = "rechazado",
}

@Entity({ name: "document_entity" })
export class DocumentEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  /** Relación con el usuario */
  @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @Column({ name: "user_id" })
  userId!: number;

  /** Información de la entidad */
  @Column({ name: "descripcion_entidad", type: "text", nullable: true })
  descripcionEntidad!: string;

  @Column({ name: "tipo_entidad", length: 100, nullable: true })
  tipoEntidad!: string;

  @Column({ name: "objeto_social", length: 255, nullable: true })
  objetoSocial!: string;

  /** Documentos requeridos */
  @Column({ name: "rut_subido", default: false })
  rutSubido!: boolean;

  @Column({ name: "camara_comercio_subido", default: false })
  camaraComercioSubido!: boolean;

  @Column({ name: "cedula_subido", default: false })
  cedulaSubido!: boolean;

  /** Documentos firmados */
  @Column({ name: "carta_intencion_subido", default: false })
  cartaIntencionSubido!: boolean;

  @Column({ name: "carta_aceptacion_subido", default: false })
  cartaAceptacionSubido!: boolean;

  /** Antecedentes */
  @Column({ name: "antecedentes_contraloria_subido", default: false })
  antecedentesContraloriaSubido!: boolean;

  @Column({ name: "antecedentes_procuraduria_subido", default: false })
  antecedentesProcuraduriaSubido!: boolean;

  @Column({ name: "antecedentes_policia_subido", default: false })
  antecedentesPoliciaSubido!: boolean;

  @Column({ name: "antecedentes_rnmc_subido", default: false })
  antecedentesRnmcSubido!: boolean;

  /** Información adicional */
  @Column({ name: "direccion_fisica", length: 255, nullable: true })
  direccionFisica!: string;

  @Column({ name: "residencia_boyaca", length: 255, nullable: true })
  residenciaBoyaca!: string;

  /** Estado general de la solicitud */
  @Column({
    type: "enum",
    enum: DocumentStatus,
    default: DocumentStatus.EN_ESPERA,
  })
  estado!: DocumentStatus;

  /** Fecha de creación */
  @CreateDateColumn({ name: "fecha_subida" })
  fechaSubida!: Date;
}

export default DocumentEntity;