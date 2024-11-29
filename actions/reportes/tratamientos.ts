// @/actions/reportes/tratamientos.ts
"use server";

import prisma from "@/lib/prisma";
import { DatosReporteTratamientos, FiltrosReporte } from "@/types/tiposreportes";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Prisma } from "@prisma/client";

export async function obtenerDatosTratamientos(filtros: FiltrosReporte): Promise<DatosReporteTratamientos> {
  let whereClause: Prisma.TratamientoWhereInput = {};

  if (filtros.rangoFecha && filtros.rangoFechas?.from && filtros.rangoFechas?.to) {
    whereClause.creadoEn = {
      gte: startOfDay(new Date(filtros.rangoFechas.from)),
      lte: endOfDay(new Date(filtros.rangoFechas.to)),
    };
  }

  // Obtener tratamientos con toda la información necesaria
  const tratamientos = await prisma.tratamiento.findMany({
    where: {
      ...whereClause,
      estado: {
        not: 0
      }
    },
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
                  email: true,
                }
              }
            }
          }
        }
      },
      pago: true,
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
    },
    orderBy: {
      creadoEn: 'desc'
    }
  });

  // Obtener veterinarios
  const veterinarios = await prisma.user.findMany({
    where: {
      // rol: 'Veterinario',
      id: {
        in: Array.from(new Set(tratamientos.map(t => t.idUsuario))) // Cambiado a Array.from
      }
    },
    select: {
      id: true,
      name: true,
      apellidoPat: true,
      apellidoMat: true,
      rol: true,
    }
  });

  const veterinariosMap = new Map(veterinarios.map(v => [v.id, v]));

  // Estadísticas básicas
  const totalTratamientos = tratamientos.length;
  const tratamientosEnProgreso = tratamientos.filter(t => t.estado === 1).length;
  const tratamientosCompletados = tratamientos.filter(t => t.estado === 2).length;
  const tratamientosCancelados = tratamientos.filter(t => t.estado === 3).length;

  const totalMedicamentos = tratamientos.reduce((sum, t) => sum + t.medicamentos.length, 0);
  const totalServicios = tratamientos.reduce((sum, t) => sum + t.servicios.length, 0);
  
  const promedioMedicamentosPorTratamiento = totalTratamientos > 0 ? 
    totalMedicamentos / totalTratamientos : 0;
  
  const promedioServiciosPorTratamiento = totalTratamientos > 0 ? 
    totalServicios / totalTratamientos : 0;

  // Calcular ingresos totales (solo de tratamientos completados)
  const ingresosTotales = tratamientos
    .filter(t => t.estado === 2 && t.pago?.estado === 2)
    .reduce((sum, t) => sum.add(t.pago?.total || new Prisma.Decimal(0)), new Prisma.Decimal(0));

    

  // Calcular efectividad (tratamientos completados / total sin cancelados)
  const tratamientosValidos = totalTratamientos - tratamientosCancelados;
  const porcentajeEfectividad = tratamientosValidos > 0 ?
    (tratamientosCompletados / tratamientosValidos) * 100 : 0;

  // Preparar datos para gráficos
  const tratamientosPorEstado = [
    { estado: 'En Progreso', cantidad: tratamientosEnProgreso },
    { estado: 'Completados', cantidad: tratamientosCompletados },
    { estado: 'Cancelados', cantidad: tratamientosCancelados }
  ];

  // Agrupar por especie
  const especiesMap = new Map<string, number>();
  tratamientos.forEach(t => {
    const especie = t.historialMascota.mascota.especie;
    especiesMap.set(especie, (especiesMap.get(especie) || 0) + 1);
  });

  const tratamientosPorEspecie = Array.from(especiesMap.entries()).map(([especie, cantidad]) => ({
    especie,
    cantidad
  }));

  // Agrupar ingresos por mes
  const ingresosPorMes = new Map<string, Prisma.Decimal>();
  tratamientos
    .filter(t => t.estado === 2 && t.pago?.estado === 2)
    .forEach(t => {
      const mes = format(t.creadoEn, 'MMMM yyyy', { locale: es });
      ingresosPorMes.set(
        mes,
        (ingresosPorMes.get(mes) || new Prisma.Decimal(0)).add(t.pago?.total || 0)
      );
    });
    

  // Medicamentos más usados
  const medicamentosMap = new Map<string, number>();
  tratamientos.forEach(t => {
    t.medicamentos.forEach(m => {
      const nombre = m.medicamento.nombre;
      medicamentosMap.set(nombre, (medicamentosMap.get(nombre) || 0) + m.cantidad);
    });
  });

  const medicamentosMasUsados = Array.from(medicamentosMap.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 15);

  // Servicios más requeridos
  const serviciosMap = new Map<string, number>();
  tratamientos.forEach(t => {
    t.servicios.forEach(s => {
      const nombre = s.servicio.nombre;
      serviciosMap.set(nombre, (serviciosMap.get(nombre) || 0) + 1);
    });
  });

  const serviciosMasRequeridos = Array.from(serviciosMap.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 15);

  // Tratamientos por veterinario
  const tratamientosPorVeterinario = veterinarios.map(vet => {
    const tratamientosVet = tratamientos.filter(t => t.idUsuario === vet.id);
    const cantidad = tratamientosVet.length;
    const tratamientosCompletadosVet = tratamientosVet.filter(t => t.estado === 2).length;
    const ingresos = tratamientosVet
      .filter(t => t.estado === 2 && t.pago?.estado === 2)
      .reduce((sum, t) => sum.add(t.pago?.total || 0), new Prisma.Decimal(0));
    
    const tratamientosValidosVet = cantidad - tratamientosVet.filter(t => t.estado === 3).length;
    const efectividad = tratamientosValidosVet > 0 ?
      (tratamientosCompletadosVet / tratamientosValidosVet) * 100 : 0;

    return {
      veterinario: `${vet.name} ${vet.apellidoPat || ''}`.trim(),
      cantidad,
      ingresos: ingresos.toString(),
      efectividad
    };
  }).sort((a, b) => b.cantidad - a.cantidad);

  // Preparar datos de retorno
  const tratamientosFormateados = tratamientos.map(t => ({
    id: t.id,
    descripcion: t.descripcion,
    estado: t.estado,
    diagnostico: t.diagnostico,
    historialMascotaId: t.historialMascotaId,
    creadoEn: t.creadoEn,
    actualizadoEn: t.actualizadoEn,
    idUsuario: t.idUsuario,
    mascota: {
      id: t.historialMascota.mascota.id,
      nombre: t.historialMascota.mascota.nombre,
      especie: t.historialMascota.mascota.especie,
      usuario: t.historialMascota.mascota.usuario
    },
    veterinario: veterinariosMap.get(t.idUsuario)!,
    totalMedicamentos: t.medicamentos.length,
    totalServicios: t.servicios.length,
    costoTotal: t.pago?.total?.toString() || '0'
  }));


  

  return {
    tratamientos: tratamientosFormateados,
    estadisticas: {
      totalTratamientos,
      tratamientosEnProgreso,
      tratamientosCompletados,
      tratamientosCancelados,
      promedioMedicamentosPorTratamiento,
      promedioServiciosPorTratamiento,
      ingresosTotales: ingresosTotales.toString(),
      porcentajeEfectividad
    },
    graficos: {
      tratamientosPorEstado,
      tratamientosPorEspecie,
      ingresosPorMes: Array.from(ingresosPorMes.entries()).map(([mes, ingresos]) => ({
        mes,
        ingresos: parseFloat(ingresos.toString())
      })),
      medicamentosMasUsados,
      serviciosMasRequeridos,
      tratamientosPorVeterinario
    }
  };
}
