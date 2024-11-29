// @/actions/reportes/reservas.ts
"use server";

import prisma from "@/lib/prisma";
import { FiltrosReporte, DatosReporteReservas, ReservaMedicaT } from "@/types/tiposreportes";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

export async function obtenerDatosReservas(filtros: FiltrosReporte): Promise<DatosReporteReservas> {
  let whereClause: any = {};

  if (filtros.rangoFecha && filtros.rangoFechas?.from && filtros.rangoFechas?.to) {
    const fromUTC = new Date(filtros.rangoFechas.from);
    const toUTC = new Date(filtros.rangoFechas.to);

    whereClause = {
      ...whereClause,
      fechaReserva: {
        gte: startOfDay(fromUTC),
        lte: endOfDay(toUTC),
      },
    };
  }

  const reservas = await prisma.reservaMedica.findMany({
    where: {
      ...whereClause,
      estado: {
        not: 0,
      }
    },
    include: {
      usuario: true,
    },
    orderBy: {
      fechaReserva: 'asc',
    },
  });
  // console.log(JSON.stringify(reservas, null, 2));


  const estadisticas: DatosReporteReservas['estadisticas'] = {
    totalReservas: reservas.length,
    reservasPendientes: 0,
    reservasCompletadas: 0,
    reservasCanceladas: 0,
    reservasPorUsuario: {},
  };

  const graficos: DatosReporteReservas['graficos'] = {
    reservasPorFecha: [],
    reservasPorEstado: [],
    reservasPorHora: [],
    reservasPorDiaSemana: [],
  };

  const reservasPorFecha: Record<string, number> = {};
  const reservasPorEstado: Record<number, number> = {};
  const reservasPorHora: Record<string, number> = {};
  const reservasPorDiaSemana: Record<string, number> = {};

  reservas.forEach((reserva) => {
    // Estadísticas por estado
    if (reserva.estado === 1) estadisticas.reservasPendientes++;
    else if (reserva.estado === 2) estadisticas.reservasCompletadas++;
    else if (reserva.estado === 3) estadisticas.reservasCanceladas++;

    // Estadísticas por usuario
    const nombreUsuario = `${reserva.usuario.name} ${reserva.usuario.apellidoPat || ''} ${reserva.usuario.apellidoMat || ''}`.trim();
    estadisticas.reservasPorUsuario[nombreUsuario] = (estadisticas.reservasPorUsuario[nombreUsuario] || 0) + 1;

    //     // Datos para gráficos
    // const fechaFormateada = format(reserva.fechaReserva, 'yyyy-MM-dd');
    // const hora = format(reserva.fechaReserva, 'HH:00');
    // const diaSemana = format(reserva.fechaReserva, 'EEEE', { locale: es });
    const fechaLocal = new Date(reserva.fechaReserva.getTime() - 4 * 60 * 60 * 1000);
    const fechaFormateada = format(fechaLocal, 'yyyy-MM-dd');
    const hora = format(fechaLocal, 'HH:00');
    const diaSemana = format(fechaLocal, 'EEEE', { locale: es });

    reservasPorFecha[fechaFormateada] = (reservasPorFecha[fechaFormateada] || 0) + 1;
    reservasPorEstado[reserva.estado] = (reservasPorEstado[reserva.estado] || 0) + 1;
    reservasPorHora[hora] = (reservasPorHora[hora] || 0) + 1;
    reservasPorDiaSemana[diaSemana] = (reservasPorDiaSemana[diaSemana] || 0) + 1;
  });

  // Convertir datos para gráficos
  graficos.reservasPorFecha = Object.entries(reservasPorFecha).map(([fecha, cantidad]) => ({ fecha, cantidad }));
  graficos.reservasPorEstado = Object.entries(reservasPorEstado).map(([estado, cantidad]) => ({
    estado: estado === '1' ? 'Pendiente' : estado === '2' ? 'Completada' : 'Cancelada',
    cantidad
  }));
  graficos.reservasPorHora = Object.entries(reservasPorHora).map(([hora, cantidad]) => ({ hora, cantidad }));
  graficos.reservasPorDiaSemana = Object.entries(reservasPorDiaSemana).map(([dia, cantidad]) => ({ dia, cantidad }));

  return {
    reservas: reservas as ReservaMedicaT[],
    estadisticas,
    graficos,
  };
}