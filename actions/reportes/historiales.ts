"use server";

import prisma from "@/lib/prisma";
import { DatosReporteHistoriales, FiltrosReporte } from "@/types/tiposreportes";
import { format, startOfDay, endOfDay, differenceInYears } from "date-fns";
import { es } from "date-fns/locale";
import { Prisma } from "@prisma/client";

export async function obtenerDatosHistoriales(filtros: FiltrosReporte): Promise<DatosReporteHistoriales> {
  let whereClause: Prisma.HistorialMedicoWhereInput = {};

  if (filtros.rangoFecha && filtros.rangoFechas?.from && filtros.rangoFechas?.to) {
    whereClause.creadoEn = {
      gte: startOfDay(new Date(filtros.rangoFechas.from)),
      lte: endOfDay(new Date(filtros.rangoFechas.to)),
    };
  }

  const historialesDb = await prisma.historialMedico.findMany({
    where: {
      ...whereClause,
      estado: {
        not: 0
      }
    },
    include: {
      mascota: {
        include: {
          usuario: {
            select: {
              id: true,
              name: true,
              apellidoPat: true,
              apellidoMat: true,
              email: true,
            }
          }
        }
      },
      tratamientos: {
        include: {
          medicamentos: {
            include: {
              medicamento: true
            }
          },
          servicios: {
            include: {
              servicio: true
            }
          }
        }
      }
    },
    orderBy: {
      creadoEn: 'desc'
    }
  });

  const historiales = historialesDb.map(historial => ({
    historialMascotaId: historial.historialMascotaId,
    descripcionTratamientos: historial.descripcionTratamientos,
    estado: historial.estado,
    creadoEn: historial.creadoEn,
    actualizadoEn: historial.actualizadoEn,
    mascota: {
      id: historial.mascota.id,
      nombre: historial.mascota.nombre,
      especie: historial.mascota.especie,
      raza: historial.mascota.raza,
      fechaNacimiento: historial.mascota.fechaNacimiento,
      sexo: historial.mascota.sexo,
      peso: historial.mascota.peso,
      esterilizado: historial.mascota.esterilizado,
      propietario: historial.mascota.usuario
    },
    tratamientos: historial.tratamientos.map(tratamiento => ({
      id: tratamiento.id,
      descripcion: tratamiento.descripcion,
      estado: tratamiento.estado,
      diagnostico: tratamiento.diagnostico,
      creadoEn: tratamiento.creadoEn,
      actualizadoEn: tratamiento.actualizadoEn,
      veterinario: {
        id: tratamiento.idUsuario,
        name: "", // Necesitarías obtener esta información
        apellidoPat: "",
        apellidoMat: "",
        rol: "Veterinario" as const,
      },
      medicamentos: tratamiento.medicamentos.map(tm => ({
        nombre: tm.medicamento.nombre,
        cantidad: tm.cantidad,
        costoUnitario: tm.costoUnitario.toString(),
      })),
      servicios: tratamiento.servicios.map(st => ({
        nombre: st.servicio.nombre,
        precioServicio: st.precioServicio.toString(),
      })),
    })),
  }));

  // Estadísticas
  const totalHistoriales = historiales.length;
  const historialesNuevos = historiales.filter(h => h.estado === 1).length;
  const historialesConTratamientoPendiente = historiales.filter(h => h.estado === 2).length;
  const historialesConTratamientosRealizados = historiales.filter(h => h.estado === 3).length;
  const historialesArchivados = historiales.filter(h => h.estado === 4).length;

  const totalTratamientos = historiales.reduce((sum, h) => sum + h.tratamientos.length, 0);
  const promedioTratamientosPorHistorial = totalHistoriales > 0 ? totalTratamientos / totalHistoriales : 0;

  const totalMedicamentos = historiales.reduce((sum, h) => 
    sum + h.tratamientos.reduce((sum2, t) => sum2 + t.medicamentos.length, 0), 0);
  const promedioMedicamentosPorTratamiento = totalTratamientos > 0 ? totalMedicamentos / totalTratamientos : 0;

  const totalServicios = historiales.reduce((sum, h) => 
    sum + h.tratamientos.reduce((sum2, t) => sum2 + t.servicios.length, 0), 0);
  const promedioServiciosPorTratamiento = totalTratamientos > 0 ? totalServicios / totalTratamientos : 0;

  // Mascotas con más tratamientos
  const mascotasConMasTratamientos = historiales
    .map(h => ({ nombre: h.mascota.nombre, cantidad: h.tratamientos.length }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5);

  // Gráficos
  const historialesPorEstado = [
    { estado: "Nuevo", cantidad: historialesNuevos },
    { estado: "Con Tratamiento Pendiente", cantidad: historialesConTratamientoPendiente },
    { estado: "Con Tratamientos Realizados", cantidad: historialesConTratamientosRealizados },
    { estado: "Archivado", cantidad: historialesArchivados },
  ];

  const historialesPorEspecie = historiales.reduce((acc, h) => {
    const especie = h.mascota.especie;
    acc[especie] = (acc[especie] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tratamientosPorMes = historiales.reduce((acc, h) => {
    h.tratamientos.forEach(t => {
      const mes = format(t.creadoEn, 'MMMM yyyy', { locale: es });
      acc[mes] = (acc[mes] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const medicamentosUsados = historiales.flatMap(h => 
    h.tratamientos.flatMap(t => t.medicamentos)
  ).reduce((acc, m) => {
    acc[m.nombre] = (acc[m.nombre] || 0) + m.cantidad;
    return acc;
  }, {} as Record<string, number>);

  const serviciosSolicitados = historiales.flatMap(h => 
    h.tratamientos.flatMap(t => t.servicios)
  ).reduce((acc, s) => {
    acc[s.nombre] = (acc[s.nombre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const edadMascotas = historiales.map(h => {
    const edad = h.mascota.fechaNacimiento 
      ? differenceInYears(new Date(), h.mascota.fechaNacimiento)
      : null;
    return edad;
  }).filter((edad): edad is number => edad !== null);

  const distribucionEdadMascotas = edadMascotas.reduce((acc, edad) => {
    const rango = 
      edad < 1 ? "Menos de 1 año" :
      edad < 3 ? "1-2 años" :
      edad < 6 ? "3-5 años" :
      edad < 9 ? "6-8 años" :
      "9+ años";
    acc[rango] = (acc[rango] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    historiales,
    estadisticas: {
      totalHistoriales,
      historialesNuevos,
      historialesConTratamientoPendiente,
      historialesConTratamientosRealizados,
      historialesArchivados,
      promedioTratamientosPorHistorial,
      promedioMedicamentosPorTratamiento,
      promedioServiciosPorTratamiento,
      mascotasConMasTratamientos,
    },
    graficos: {
      historialesPorEstado,
      historialesPorEspecie: Object.entries(historialesPorEspecie).map(([especie, cantidad]) => ({ especie, cantidad })),
      tratamientosPorMes: Object.entries(tratamientosPorMes).map(([mes, cantidad]) => ({ mes, cantidad })),
      top10MedicamentosUsados: Object.entries(medicamentosUsados)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([nombre, cantidad]) => ({ nombre, cantidad })),
      top10ServiciosSolicitados: Object.entries(serviciosSolicitados)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([nombre, cantidad]) => ({ nombre, cantidad })),
      distribucionEdadMascotas: Object.entries(distribucionEdadMascotas)
        .map(([rango, cantidad]) => ({ rango, cantidad })),
    },
  };
}