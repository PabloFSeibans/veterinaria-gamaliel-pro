"use server";

import prisma from "@/lib/prisma";
import { DatosReportePagos, FiltrosReporte } from "@/types/tiposreportes";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Prisma } from "@prisma/client";

export async function obtenerDatosPagos(filtros: FiltrosReporte): Promise<DatosReportePagos> {
  let whereClause: Prisma.PagoWhereInput = {};

  if (filtros.rangoFecha && filtros.rangoFechas?.from && filtros.rangoFechas?.to) {
    whereClause.creadoEn = {
      gte: startOfDay(new Date(filtros.rangoFechas.from)),
      lte: endOfDay(new Date(filtros.rangoFechas.to)),
    };
  }

  const pagosDb = await prisma.pago.findMany({
    where: {
      ...whereClause,
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

  // Convertir los pagos al formato esperado por PagoReporteT
  const pagos = pagosDb.map(pago => ({
    id: pago.id,
    total: pago.total.toString(),
    fechaPago: pago.fechaPago,
    metodoPago: pago.metodoPago,
    detalle: pago.detalle,
    estado: pago.estado,
    esAyudaVoluntaria: pago.esAyudaVoluntaria,
    creadoEn: pago.creadoEn,
    actualizadoEn: pago.actualizadoEn,
    idUsuario: pago.idUsuario,
    tratamiento: {
      id: pago.tratamiento.id,
      descripcion: pago.tratamiento.descripcion,
      estado: pago.tratamiento.estado,
      historialMascota: {
        mascota: {
          id: pago.tratamiento.historialMascota.mascota.id,
          nombre: pago.tratamiento.historialMascota.mascota.nombre,
          especie: pago.tratamiento.historialMascota.mascota.especie,
          usuario: pago.tratamiento.historialMascota.mascota.usuario
        }
      }
    }
  }));

  // Estadísticas básicas
  const totalPagos = pagos.length;
  const pagosPendientes = pagos.filter(p => p.estado === 1).length;
  const pagosCompletados = pagos.filter(p => p.estado === 2).length;
  const pagosCancelados = pagos.filter(p => p.estado === 3).length;

  // Calcular totales
  const totalIngresos = pagosDb
    .filter(p => p.estado === 2)
    .reduce((sum, p) => sum.add(p.total), new Prisma.Decimal(0));

  const promedioIngresos = pagosCompletados > 0 
    ? totalIngresos.dividedBy(pagosCompletados)
    : new Prisma.Decimal(0);

  const totalAyudaVoluntaria = pagosDb
    .filter(p => p.estado === 2 && p.esAyudaVoluntaria)
    .reduce((sum, p) => sum.add(p.total), new Prisma.Decimal(0));

  // Conteo por método de pago
  const pagosEfectivo = pagos.filter(p => p.metodoPago === 'Efectivo').length;
  const pagosTransferencia = pagos.filter(p => p.metodoPago === 'Transferencia').length;
  const pagosTarjeta = pagos.filter(p => p.metodoPago === 'Tarjeta').length;
  const pagosQr = pagos.filter(p => p.metodoPago === 'Qr').length;
  const pagosOtro = pagos.filter(p => p.metodoPago === 'Otro').length;

  // Datos para gráficos
  const pagosPorEstado = [
    { estado: 'Pendientes', cantidad: pagosPendientes },
    { estado: 'Completados', cantidad: pagosCompletados },
    { estado: 'Cancelados', cantidad: pagosCancelados }
  ];

  const pagosPorMetodo = [
    { metodo: 'Efectivo', cantidad: pagosEfectivo },
    { metodo: 'Transferencia', cantidad: pagosTransferencia },
    { metodo: 'Tarjeta', cantidad: pagosTarjeta },
    { metodo: 'QR', cantidad: pagosQr },
    { metodo: 'Otro', cantidad: pagosOtro }
  ];

  // Ingresos por mes
  const ingresosPorMes = new Map<string, number>();
  pagosDb
    .filter(p => p.estado === 2)
    .forEach(p => {
      const mes = format(p.creadoEn, 'MMMM yyyy', { locale: es });
      ingresosPorMes.set(
        mes,
        (ingresosPorMes.get(mes) || 0) + Number(p.total)
      );
    });

  // Pagos por día de la semana
  const pagosPorDia = new Map<string, number>();
  pagos.forEach(p => {
    const dia = format(p.creadoEn, 'EEEE', { locale: es });
    pagosPorDia.set(dia, (pagosPorDia.get(dia) || 0) + 1);
  });

  // Distribución de ayuda voluntaria vs pagos normales
  const distribucionAyudaVoluntaria = [
    {
      tipo: 'Ayuda Voluntaria',
      total: totalAyudaVoluntaria.toString()
    },
    {
      tipo: 'Pagos Regulares',
      total: totalIngresos.sub(totalAyudaVoluntaria).toString()
    }
  ];

  // Top clientes por pagos
  const clientesPagos = new Map<number, { 
    nombre: string; 
    pagos: number; 
    total: Prisma.Decimal 
  }>();

  pagosDb.forEach(p => {
    const cliente = p.tratamiento.historialMascota.mascota.usuario;
    if (cliente) {
      const clienteData = clientesPagos.get(cliente.id) || {
        nombre: `${cliente.name} ${cliente.apellidoPat || ''} ${cliente.apellidoMat || ''}`.trim(),
        pagos: 0,
        total: new Prisma.Decimal(0)
      };
      
      clientesPagos.set(cliente.id, {
        ...clienteData,
        pagos: clienteData.pagos + 1,
        total: clienteData.total.add(p.total)
      });
    }
  });

  const topClientesPagos = Array.from(clientesPagos.values())
    .map(({ nombre, pagos, total }) => ({
      nombreCliente: nombre,
      cantidadPagos: pagos,
      totalPagado: total.toString()
    }))
    .sort((a, b) => b.cantidadPagos - a.cantidadPagos)
    .slice(0, 10);

  return {
    pagos,
    estadisticas: {
      totalPagos,
      pagosPendientes,
      pagosCompletados,
      pagosCancelados,
      totalIngresos: totalIngresos.toString(),
      promedioIngresos: promedioIngresos.toString(),
      totalAyudaVoluntaria: totalAyudaVoluntaria.toString(),
      pagosEfectivo,
      pagosTransferencia,
      pagosTarjeta,
      pagosQr,
      pagosOtro
    },
    graficos: {
      pagosPorEstado,
      pagosPorMetodo,
      ingresosPorMes: Array.from(ingresosPorMes.entries()).map(([mes, ingresos]) => ({
        mes,
        ingresos
      })),
      pagosPorDia: Array.from(pagosPorDia.entries()).map(([dia, cantidad]) => ({
        dia,
        cantidad
      })),
      distribucionAyudaVoluntaria,
      topClientesPagos
    }
  };
}