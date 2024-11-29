"use server";

import prisma from "@/lib/prisma";
import { DatosReporteUsuarios, FiltrosReporte } from "@/types/tiposreportes";
import { format, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Prisma } from "@prisma/client";

export async function obtenerDatosUsuarios(filtros: FiltrosReporte): Promise<DatosReporteUsuarios> {
  let whereClause: any = {};

  if (filtros.rangoFecha && filtros.rangoFechas?.from && filtros.rangoFechas?.to) {
    const fromUTC = new Date(filtros.rangoFechas.from);
    const toUTC = new Date(filtros.rangoFechas.to);

    whereClause = {
      ...whereClause,
      createdAt: {
        gte: startOfDay(fromUTC),
        lte: endOfDay(toUTC),
      },
    };
  }

  const usuariosConDetalles = await prisma.user.findMany({
    where: {
      ...whereClause,
      estado:{
        not: 0
      }
    },
    select: {
      id: true,
      name: true,
      apellidoPat: true,
      apellidoMat: true,
      email: true,
      rol: true,
      estado: true,
      emailVerified: true,
      authDobleFactor: true,
      createdAt: true,
      mascotas: {
        select: {
          id: true,
          historial: {
            select: {
              tratamientos: {
                select: {
                  id: true,
                  estado: true,
                  pago: {
                    select: {
                      estado: true,
                      total: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const usuariosExtendidos = usuariosConDetalles.map(usuario => {
    const cantidadMascotas = usuario.mascotas.length;
    let cantidadTratamientos = 0;
    let pagosPendientes = 0;
    let totalPagado = new Prisma.Decimal(0);

    usuario.mascotas.forEach(mascota => {
      if (mascota.historial?.tratamientos) {
        mascota.historial.tratamientos.forEach(tratamiento => {
          // Solo contar tratamientos completados o en progreso
          if (tratamiento.estado !== 3) { // No contar tratamientos cancelados
            cantidadTratamientos++;
            if (tratamiento.pago?.estado === 1) { // Pendiente
              pagosPendientes++;
            } else if (tratamiento.pago?.estado === 2) { // Completado
              totalPagado = totalPagado.add(tratamiento.pago.total || 0);
            }
          }
        });
      }
    });

    return {
      ...usuario,
      cantidadMascotas,
      cantidadTratamientos,
      pagosPendientes,
      totalPagado: totalPagado.toString(),
    };
  });

  // Separar usuarios según pagos pendientes
  const usuariosConPagos = usuariosExtendidos.filter(u => u.pagosPendientes > 0);
  const usuariosSinPagos = usuariosExtendidos.filter(u => u.pagosPendientes === 0);

  // Estadísticas básicas
  const totalUsuarios = usuariosExtendidos.length;
  const usuariosActivos = usuariosExtendidos.filter(u => u.estado === 1).length;
  const usuariosInactivos = usuariosExtendidos.filter(u => u.estado === 2).length;
  const usuariosVerificados = usuariosExtendidos.filter(u => u.emailVerified !== null).length;
  const usuariosNoVerificados = usuariosExtendidos.filter(u => u.emailVerified === null).length;
  
  const totalPagosRecibidos = usuariosExtendidos.reduce((acc, user) => {
    return acc.add(new Prisma.Decimal(user.totalPagado));
  }, new Prisma.Decimal(0));

  // Conteo por rol
  const usuariosPorRol = usuariosExtendidos.reduce((acc: Record<string, number>, user) => {
    acc[user.rol] = (acc[user.rol] || 0) + 1;
    return acc;
  }, {});

  // Datos para gráficos
  const usuariosPorEstado = [
    { estado: "Activos", cantidad: usuariosActivos },
    { estado: "Inactivos", cantidad: usuariosInactivos },
  ];

  const usuariosPorVerificacion = [
    { estado: "Verificados", cantidad: usuariosVerificados },
    { estado: "No Verificados", cantidad: usuariosNoVerificados },
  ];

  // Top 10 clientes frecuentes
  const clientesFrecuentes = usuariosExtendidos
    .sort((a, b) => b.cantidadTratamientos - a.cantidadTratamientos)
    .slice(0, 10)
    .map(usuario => ({
      nombre: `${usuario.name} ${usuario.apellidoPat || ''}`.trim(),
      cantidadMascotas: usuario.cantidadMascotas,
      cantidadTratamientos: usuario.cantidadTratamientos,
      totalPagado: usuario.totalPagado,
    }));

  // Distribución de pagos
  const distribucionPagos = [
    {
      estado: "Pendientes",
      cantidad: usuariosConPagos.length,
      total: usuariosConPagos
        .reduce((acc, user) => acc.add(new Prisma.Decimal(user.totalPagado)), new Prisma.Decimal(0))
        .toString(),
    },
    {
      estado: "Completados",
      cantidad: usuariosSinPagos.length,
      total: totalPagosRecibidos.toString(),
    },
  ];

  return {
    usuarios: {
      conPagosPendientes: usuariosConPagos,
      sinPagosPendientes: usuariosSinPagos,
    },
    estadisticas: {
      totalUsuarios,
      usuariosActivos,
      usuariosInactivos,
      usuariosPorRol,
      usuariosConPagosPendientes: usuariosConPagos.length,
      totalPagosRecibidos: totalPagosRecibidos.toString(),
      usuariosVerificados,
      usuariosNoVerificados,
    },
    graficos: {
      usuariosPorRol: Object.entries(usuariosPorRol).map(([rol, cantidad]) => ({
        rol,
        cantidad,
      })),
      usuariosPorEstado,
      usuariosPorVerificacion,
      clientesFrecuentes,
      distribucionPagos,
    },
  };
}