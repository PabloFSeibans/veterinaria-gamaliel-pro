// @/types/pagos.ts
import { TipoMascota, Sexo, RolUsuario, MetodoPago } from '@prisma/client';

export interface PagoResumen {
  id: number;
  total: number;
  fechaPago: Date | null;
  metodoPago: string | null;
  estado: number;
  detalle: string | null;
  esAyudaVoluntaria: boolean;
  idUsuario: number;
  creadoEn: Date;
  actualizadoEn: Date | null;
  tratamientoId: number;
  tratamientoDescripcion: string;
  tratamientoEstado: number;
  historialMascotaId: number;
  mascotaId: number | null;
  mascotaNombre: string | null;
  mascotaEspecie: string | null;
  mascotaRaza: string | null;
  mascotaSexo: Sexo | null;
  mascotaImagen: string | null;
  idPropietario?: number | null;
  usuarioNombreCompleto: string | null;
  usuarioEmail: string | null;
  usuarioCelular: string | null;
}




export interface TratamientoCompleto {
  id: number;
  descripcion: string;
  estado: number;
  diagnostico: string | null;
  fechaCreacion: Date;
  fechaActualizacion: Date | null;
  historialMascotaId: number;
  pago: {
    id?: number;
    total: number;
    fechaPago: Date | null;
    metodoPago: MetodoPago | null;
    esAyudaVoluntaria: boolean;
    detalle: string | null;
    estado: number;
    idUsuario: number;
    creadoEn: Date;
    actualizadoEn?: Date | null;
  } | null;
  servicios: {
    id: number;
    nombre: string;
    precio: number;
  }[];
  medicamentos: {
    id: number;
    nombre: string;
    codigo: string | null;
    costoUnitario: number;
    cantidad: number;
    dosificacion: string | null;
    total: number;
  }[];
  sumaTotalServicios: number;
  sumaTotalMedicamentos: number;
  mascota: {
    id: number;
    nombre: string;
    especie: TipoMascota;
    sexo: Sexo;
    raza: string | null;
  };
  propietario: {
    id: number;
    nombre: string;
    apellidoPat: string | null;
    apellidoMat: string | null;
    email: string | null;
    celular: string | null;
    ci?: string | null;
  } | null;
}

export interface ResumenIngresos {
  ingresoSemanal: string;
  ingresoMensual: string;
  porcentajeCambioSemanal: number;
  porcentajeCambioMensual: number;
}