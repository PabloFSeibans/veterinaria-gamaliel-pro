// @/actions/reportes/servicios.ts
"use server";

import prisma from "@/lib/prisma";
import { DatosReporteServicios, FiltrosReporte, ServicioReporteT } from "@/types/tiposreportes";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import Decimal from "decimal.js";

export async function obtenerDatosServicios(filtros: FiltrosReporte): Promise<DatosReporteServicios> {
  let whereClause: any = {};

  if (filtros.rangoFecha && filtros.rangoFechas?.from && filtros.rangoFechas?.to) {
    const fromUTC = new Date(filtros.rangoFechas.from);
    const toUTC = new Date(filtros.rangoFechas.to);

    whereClause = {
      ...whereClause,
      creadoEn: {
        gte: startOfDay(fromUTC),
        lte: endOfDay(toUTC),
      },
    };
  }

  const servicios = await prisma.servicio.findMany({
    where: {
      ...whereClause,
      estado: {
        not: 0,
      },
    },
    include: {
      tratamientos: {
        include: {
          tratamiento: {
            include: {
              historialMascota: {
                include: {
                  mascota: {
                    include: {
                      usuario: {
                        select: {
                          name: true,
                          apellidoPat: true,
                          apellidoMat: true,
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    },
    orderBy: {
      nombre: 'asc',
    },
  });

  // Procesar datos
  const serviciosConEstadisticas = servicios.map(servicio => {
    const usos = servicio.tratamientos.length;
    const ingresos = servicio.tratamientos.reduce((total, st) => {
      if (st.tratamiento.estado === 2) { // Solo tratamientos completados
        return total.plus(new Decimal(st.precioServicio));
      }
      return total;
    }, new Decimal(0));

    return {
      id: servicio.id,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio.toString(),
      estado: servicio.estado,
      creadoEn: servicio.creadoEn,
      usos,
      ingresos: ingresos.toNumber(),
    };
  });

  // Estadísticas
  const totalServicios = servicios.length;
  const serviciosActivos = servicios.filter(s => s.estado === 1).length;
  const serviciosInactivos = servicios.filter(s => s.estado === 2).length;
  const promedioPrecios = servicios.reduce((acc, s) => acc.plus(s.precio), new Decimal(0))
    .dividedBy(servicios.length || 1)
    .toNumber();

  const serviciosMasUtilizados = serviciosConEstadisticas
    .sort((a, b) => b.usos - a.usos)
    .slice(0, 10)
    .map(s => ({ nombre: s.nombre, usos: s.usos }));

  const ingresosTotales = serviciosConEstadisticas.reduce((total, s) => total + s.ingresos, 0);

  // Datos para gráficos
  const serviciosPorEstado = [
    { estado: "Disponibles", cantidad: serviciosActivos },
    { estado: "No Disponibles", cantidad: serviciosInactivos },
  ];

  const serviciosPorPrecio = serviciosConEstadisticas
    .map(s => ({
      nombre: s.nombre.length > 20 ? s.nombre.substring(0, 20) + "..." : s.nombre,
      precio: parseFloat(s.precio),
    }))
    .sort((a, b) => b.precio - a.precio);

  const serviciosPorUso = serviciosConEstadisticas
    .map(s => ({
      nombre: s.nombre.length > 20 ? s.nombre.substring(0, 20) + "..." : s.nombre,
      usos: s.usos,
    }))
    .sort((a, b) => b.usos - a.usos)
    .slice(0, 10);

  const ingresosPorServicio = serviciosConEstadisticas
    .map(s => ({
      nombre: s.nombre.length > 20 ? s.nombre.substring(0, 20) + "..." : s.nombre,
      ingresos: s.ingresos,
    }))
    .sort((a, b) => b.ingresos - a.ingresos);

  // Tendencia de uso por mes
  const tendenciaUsoServicios = servicios.reduce((acc: Record<string, number>, servicio) => {
    servicio.tratamientos.forEach(st => {
      const mes = format(st.tratamiento.creadoEn, 'MMMM yyyy', { locale: es });
      acc[mes] = (acc[mes] || 0) + 1;
    });
    return acc;
  }, {});

  return {
    servicios: serviciosConEstadisticas as ServicioReporteT[],
    estadisticas: {
      totalServicios,
      serviciosActivos,
      serviciosInactivos,
      promedioPrecios,
      serviciosMasUtilizados,
      ingresosTotales,
    },
    graficos: {
      serviciosPorEstado,
      serviciosPorPrecio,
      serviciosPorUso,
      ingresosPorServicio,
      tendenciaUsoServicios: Object.entries(tendenciaUsoServicios).map(([mes, usos]) => ({
        mes,
        usos,
      })),
    },
  };
}