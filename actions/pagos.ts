// @/actions/pagos.ts
"use server"
import prisma from "@/lib/prisma";
import Decimal from 'decimal.js';
import { PagoResumen, TratamientoCompleto, ResumenIngresos } from '@/types/pagos';
import { usuarioIdActual } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PagoSchema } from "@/schemas";
import { z } from "zod";
import {PagoT} from "@/types";
import { MetodoPago } from "@prisma/client";

export const obtenerPagos = async (): Promise<PagoResumen[]> => {
  try {
    const pagos = await prisma.pago.findMany({
      where: {
        estado: {
          not: 0
        }
      },
      include: {
        tratamiento: {
          include: {
            historialMascota: {
              include: {
                mascota: {
                  include: {
                    usuario: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        creadoEn: 'desc'
      }
    });

    return pagos.map(pago => ({
      id: pago.id,
      total: pago.total.toNumber(),
      fechaPago: pago.fechaPago,
      metodoPago: pago.metodoPago,
      estado: pago.estado,
      detalle: pago.detalle,
      esAyudaVoluntaria: pago.esAyudaVoluntaria,
      idUsuario: pago.idUsuario,
      creadoEn: pago.creadoEn,
      actualizadoEn: pago.actualizadoEn,
      tratamientoId: pago.tratamiento.id,
      tratamientoDescripcion: pago.tratamiento.descripcion,
      tratamientoEstado: pago.tratamiento.estado,
      historialMascotaId: pago.tratamiento.historialMascota.historialMascotaId,
      mascotaId: pago.tratamiento.historialMascota.mascota.id,
      mascotaNombre: pago.tratamiento.historialMascota.mascota.nombre,
      mascotaEspecie: pago.tratamiento.historialMascota.mascota.especie,
      mascotaRaza: pago.tratamiento.historialMascota.mascota.raza,
      mascotaSexo: pago.tratamiento.historialMascota.mascota.sexo,
      mascotaImagen: pago.tratamiento.historialMascota.mascota.imagen,
      idPropietario: pago.tratamiento.historialMascota.mascota.usuario?.id,
      usuarioNombreCompleto: pago.tratamiento.historialMascota.mascota.usuario
        ? `${pago.tratamiento.historialMascota.mascota.usuario.name} ${pago.tratamiento.historialMascota.mascota.usuario.apellidoPat || ''} ${pago.tratamiento.historialMascota.mascota.usuario.apellidoMat || ''}`.trim()
        : null,
      usuarioEmail: pago.tratamiento.historialMascota.mascota.usuario?.email || null,
      usuarioCelular: pago.tratamiento.historialMascota.mascota.usuario?.celular || null,
    }));
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    return [];
  }
}

export const obtenerTratamientoCompleto = async (tratamientoId: number): Promise<TratamientoCompleto | null> => {
  try {
    const tratamiento = await prisma.tratamiento.findUnique({
      where: { id: tratamientoId },
      include: {
        pago: true,
        servicios: {
          include: { servicio: true }
        },
        medicamentos: {
          include: { medicamento: true }
        },
        historialMascota: {
          include: {
            mascota: {
              include: {
                usuario: true
              }
            }
          }
        }
      }
    });

    if (!tratamiento) return null;

    const servicios = tratamiento.servicios.map(st => ({
      id: st.servicioId,
      nombre: st.servicio.nombre,
      precio: st.precioServicio.toNumber(),
    }));

    const medicamentos = tratamiento.medicamentos.map(tm => ({
      id: tm.medicamentoId,
      nombre: tm.medicamento.nombre,
      codigo: tm.medicamento.codigo,
      costoUnitario: tm.costoUnitario.toNumber(),
      cantidad: tm.cantidad,
      dosificacion: tm.dosificacion,
      total: tm.costoUnitario.toNumber() * tm.cantidad,
    }));

    const sumaTotalServicios = servicios.reduce((sum, s) => sum + s.precio, 0);
    const sumaTotalMedicamentos = medicamentos.reduce((sum, m) => sum + m.total, 0);

    return {
      id: tratamiento.id,
      descripcion: tratamiento.descripcion,
      estado: tratamiento.estado,
      diagnostico: tratamiento.diagnostico,
      fechaCreacion: tratamiento.creadoEn,
      fechaActualizacion: tratamiento.actualizadoEn,
      historialMascotaId: tratamiento.historialMascotaId,
      pago: tratamiento.pago ? {
        id: tratamiento.pago.id,
        total: tratamiento.pago.total.toNumber(),
        detalle: tratamiento.pago.detalle || null,
        fechaPago: tratamiento.pago.fechaPago,
        esAyudaVoluntaria: tratamiento.pago.esAyudaVoluntaria,
        metodoPago: tratamiento.pago.metodoPago as MetodoPago,
        estado: tratamiento.pago.estado,
        idUsuario: tratamiento.pago.idUsuario,
        creadoEn: tratamiento.pago.creadoEn,
        actualizadoEn: tratamiento.pago.actualizadoEn,
      } : null,
      servicios,
      medicamentos,
      sumaTotalServicios,
      sumaTotalMedicamentos,
      mascota: {
        id: tratamiento.historialMascota.mascota.id,
        nombre: tratamiento.historialMascota.mascota.nombre,
        especie: tratamiento.historialMascota.mascota.especie,
        sexo: tratamiento.historialMascota.mascota.sexo,
        raza: tratamiento.historialMascota.mascota.raza,
      },
      propietario: tratamiento.historialMascota.mascota.usuario ? {
        id: tratamiento.historialMascota.mascota.usuario.id,
        nombre: tratamiento.historialMascota.mascota.usuario.name,
        apellidoPat: tratamiento.historialMascota.mascota.usuario.apellidoPat,
        apellidoMat: tratamiento.historialMascota.mascota.usuario.apellidoMat,
        email: tratamiento.historialMascota.mascota.usuario.email,
        celular: tratamiento.historialMascota.mascota.usuario.celular,
        ci: tratamiento.historialMascota.mascota.usuario.ci,
      } : null,
    };
  } catch (error) {
    console.error("Error al obtener el tratamiento completo:", error);
    return null;
  }
}


export const obtenerResumenIngresos = async (): Promise<ResumenIngresos> => {
  try {
    // Obtener total de ingresos verificados (estado = 2)
    const ingresosVerificados = await prisma.pago.aggregate({
      _sum: { total: true },
      where: {
        estado: 2
      }
    });

    // Obtener total de ingresos (excluyendo eliminados, estado != 0)
    const ingresosTotales = await prisma.pago.aggregate({
      _sum: { total: true },
      where: {
        estado: {
          not: 0
        }
      }
    });

    const totalVerificado = ingresosVerificados._sum.total || new Decimal(0);
    const totalGeneral = ingresosTotales._sum.total || new Decimal(0);

    // Calcular el porcentaje de ingresos verificados respecto al total
    const porcentajeVerificados = totalGeneral.isZero() 
      ? 0 
      : totalVerificado.dividedBy(totalGeneral).times(100).toNumber();

    // El porcentaje de ingresos totales será 100% si hay ingresos, 0% si no hay
    const porcentajeTotales = totalGeneral.isZero() ? 0 : 100;

    return {
      ingresoSemanal: totalVerificado.toFixed(2),
      ingresoMensual: totalGeneral.toFixed(2),
      porcentajeCambioSemanal: porcentajeVerificados,
      porcentajeCambioMensual: porcentajeTotales,
    };
  } catch (error) {
    console.error("Error al obtener el resumen de ingresos:", error);
    return {
      ingresoSemanal: "0.00",
      ingresoMensual: "0.00",
      porcentajeCambioSemanal: 0,
      porcentajeCambioMensual: 0,
    };
  }
}

export async function editarPago(valores: z.infer<typeof PagoSchema>, pagoId: number) {
  try {
    // Validar los datos con Zod
    const validacion = PagoSchema.safeParse(valores);
    
    if (!validacion.success) {
      const errores = validacion.error.errors.map(error => error.message);
      return {
        error: errores.join(", ")
      };
    }

    const idUActual = await usuarioIdActual();

    if (!idUActual) {
      return {
        error: "No se encontró el usuario autenticado"
      };
    }

    const fechaActual = new Date();

    const resultado = await prisma.$transaction(async (tx) => {
      const pagoExistente = await tx.pago.findUnique({
        where: { id: pagoId },
        include: {
          tratamiento: true
        }
      });

      if (!pagoExistente) {
        throw new Error("El pago no existe");
      }

      const pagoActualizado = await tx.pago.update({
        where: { id: pagoId },
        data: {
          metodoPago: valores.metodoPago,
          detalle: valores.detalle,
          estado: valores.estado,
          esAyudaVoluntaria: valores.esAyudaVoluntaria,
          fechaPago: valores.estado === 2 ? fechaActual : null,
          actualizadoEn: fechaActual,
          idUsuario: idUActual
        }
      });

      const tratamientoActualizado = await tx.tratamiento.update({
        where: { id: pagoExistente.id },
        data: {
          estado: valores.estado,
          idUsuario: idUActual
        }
      });

      if (valores.estado === 2) {
        await tx.historialMedico.update({
          where: { historialMascotaId: tratamientoActualizado.historialMascotaId },
          data: {
            estado: 3,
            actualizadoEn: fechaActual,
            idUsuario: idUActual
          }
        });
      }

      return { pago: pagoActualizado, tratamiento: tratamientoActualizado };
    }, {
      timeout: 30000,
      maxWait: 35000,
      isolationLevel: 'Serializable'
    });
    revalidatePath("/admin/pagos")
    revalidatePath("/admin/tratamientos")
    revalidatePath("/admin/mascotas")
    revalidatePath("/admin/historiales")
    revalidatePath("/admin")
    revalidatePath(`/admin/pagos/${pagoId}`);

    return {
      success: "Pago y tratamiento actualizados correctamente",
      data: resultado
    };

  } catch (error) {
    console.error("Error al actualizar el pago:", error);
    if (error instanceof Error) {
      return {
        error: error.message
      };
    }
    return {
      error: "Error al actualizar el pago y el tratamiento"
    };
  }
}



export const obtenerPago = async (pagoId: number): Promise<PagoT | null> => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: pagoId },
      include: {
        tratamiento: true
      }
    });

    if (!pago) return null;

    return {
      id: pago.id,
      total: pago.total.toString(),
      fechaPago: pago.fechaPago,
      metodoPago: pago.metodoPago,
      detalle: pago.detalle,
      estado: pago.estado,
      esAyudaVoluntaria: pago.esAyudaVoluntaria,
      tratamiento: pago.tratamiento,
      creadoEn: pago.creadoEn,
      actualizadoEn: pago.actualizadoEn,
      idUsuario: pago.idUsuario
    };
  } catch (error) {
    console.error("Error al obtener el pago:", error);
    return null;
  }
}

export async function eliminarPago(pagoId: number) {
  try {
    const idUActual = await usuarioIdActual();

    if (!idUActual) {
      return {
        error: "No se encontró el usuario autenticado"
      };
    }

    const resultado = await prisma.$transaction(async (tx) => {
      // Primero obtenemos el pago para tener el ID del tratamiento
      const pago = await tx.pago.findUnique({
        where: { id: pagoId },
        include: {
          tratamiento: true
        }
      });

      if (!pago) {
        throw new Error("El pago no existe");
      }

      // Actualizamos el estado del pago a 0 (eliminado)
      const pagoActualizado = await tx.pago.update({
        where: { id: pagoId },
        data: {
          estado: 0,
          idUsuario: idUActual
        }
      });

      // Actualizamos el estado del tratamiento a 0 (eliminado)
      const tratamientoActualizado = await tx.tratamiento.update({
        where: { id: pago.tratamiento.id },
        data: {
          estado: 0,
          idUsuario: idUActual
        }
      });

      return { pago: pagoActualizado, tratamiento: tratamientoActualizado };
    }, {
      timeout: 30000,
      maxWait: 35000,
      isolationLevel: 'Serializable'
    });

    revalidatePath("/admin/pagos")
    revalidatePath("/admin/tratamientos")
    revalidatePath("/admin/mascotas")
    revalidatePath("/admin/historiales")
    revalidatePath("/admin")
    revalidatePath(`/admin/pagos/${pagoId}`);

    return {
      success: "Pago y tratamiento eliminados correctamente",
      data: resultado
    };

  } catch (error) {
    console.error("Error al eliminar el pago:", error);
    if (error instanceof Error) {
      return {
        error: error.message
      };
    }
    return {
      error: "Error al eliminar el pago y el tratamiento"
    };
  }
}