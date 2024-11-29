'use server'

import prisma from '@/lib/prisma'
import { RolUsuario, Sexo, TipoMascota, TipoMedicamento, MetodoPago } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import Decimal from 'decimal.js';
import { startOfDay, endOfDay, subDays, format } from 'date-fns'


export async function getEstadisticas() {
  const [
    usuariosStats,
    mascotasStats,
    historialesStat,
    tratamientosStats,
    pagosStats,
    medicamentosStats,
    serviciosStats,
    reservasStats,
    servicioTratamientoCount,
    tratamientoMedicamentoCount
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ['rol'],
      _count: true,
      where: { estado: { not: 0 } }
    }),
    prisma.mascota.groupBy({
      by: ['especie', 'sexo', 'esterilizado'],
      _count: true,
      where: { estado: { not: 0 } }
    }),
    prisma.historialMedico.groupBy({
      by: ['estado'],
      _count: true,
      where: { estado: { not: 0 } }
    }),
    prisma.tratamiento.groupBy({
      by: ['estado'],
      _count: true,
      where: { estado: { not: 0 } }
    }),
    prisma.pago.groupBy({
      by: ['estado', 'esAyudaVoluntaria', 'metodoPago'],
      _count: true,
      where: { estado: { not: 0 } }
    }),
    prisma.medicamento.groupBy({
      by: ['tipo'],
      _count: {
        id: true,
        codigo: true
      },
      where: { estado: { not: 0 } }
    }),
    prisma.servicio.groupBy({
      by: ['estado'],
      _count: true,
      where: { estado: { not: 0 } }
    }),
    prisma.reservaMedica.groupBy({
      by: ['estado'],
      _count: true,
      where: { estado: { not: 0 } }
    }),
    prisma.servicioTratamiento.count(),
    prisma.tratamientoMedicamento.count()
  ])

  const totalUsuarios = usuariosStats.reduce((acc, curr) => acc + curr._count, 0)
  const usuarios = {
    total: totalUsuarios,
    porRol: Object.fromEntries(usuariosStats.map(u => [u.rol, u._count])),
    porcentajePorRol: Object.fromEntries(usuariosStats.map(u => [u.rol, (u._count / totalUsuarios * 100).toFixed(2) + '%'])),
    verificados: await prisma.user.count({ where: { emailVerified: { not: null }, estado: { not: 0 } } }),
    noVerificados: await prisma.user.count({ where: { emailVerified: null, estado: { not: 0 } } }),
    conGoogle: await prisma.account.count({ where: { provider: 'google' } })
  }

  const totalMascotas = mascotasStats.reduce((acc, curr) => acc + curr._count, 0)
  const mascotas = {
    total: totalMascotas,
    porEspecie: Object.fromEntries(
      Object.values(TipoMascota).map(tipo => [
        tipo,
        mascotasStats.filter(m => m.especie === tipo).reduce((acc, curr) => acc + curr._count, 0)
      ])
    ),
    porcentajePorEspecie: Object.fromEntries(
      Object.values(TipoMascota).map(tipo => [
        tipo,
        ((mascotasStats.filter(m => m.especie === tipo).reduce((acc, curr) => acc + curr._count, 0) / totalMascotas) * 100).toFixed(2) + '%'
      ])
    ),
    porSexo: Object.fromEntries(
      Object.values(Sexo).map(sexo => [
        sexo,
        mascotasStats.filter(m => m.sexo === sexo).reduce((acc, curr) => acc + curr._count, 0)
      ])
    ),
    porcentajePorSexo: Object.fromEntries(
      Object.values(Sexo).map(sexo => [
        sexo,
        ((mascotasStats.filter(m => m.sexo === sexo).reduce((acc, curr) => acc + curr._count, 0) / totalMascotas) * 100).toFixed(2) + '%'
      ])
    ),
    esterilizados: mascotasStats.filter(m => m.esterilizado === true).reduce((acc, curr) => acc + curr._count, 0),
    noEsterilizados: mascotasStats.filter(m => m.esterilizado === false || m.esterilizado === null).reduce((acc, curr) => acc + curr._count, 0),
    porcentajeEsterilizados: ((mascotasStats.filter(m => m.esterilizado === true).reduce((acc, curr) => acc + curr._count, 0) / totalMascotas) * 100).toFixed(2) + '%',
    porcentajeNoEsterilizados: ((mascotasStats.filter(m => m.esterilizado === false || m.esterilizado === null).reduce((acc, curr) => acc + curr._count, 0) / totalMascotas) * 100).toFixed(2) + '%'
  }

  const totalHistoriales = historialesStat.reduce((acc, curr) => acc + curr._count, 0)
  const historiales = {
    total: totalHistoriales,
    porEstado: Object.fromEntries(historialesStat.map(t => [t.estado, t._count])),
    porcentajePorEstado: Object.fromEntries(historialesStat.map(t => [t.estado, ((t._count / totalHistoriales) * 100).toFixed(2) + '%']))
  }
  const totalTratamientos = tratamientosStats.reduce((acc, curr) => acc + curr._count, 0)
  const tratamientos = {
    total: totalTratamientos,
    porEstado: Object.fromEntries(tratamientosStats.map(t => [t.estado, t._count])),
    porcentajePorEstado: Object.fromEntries(tratamientosStats.map(t => [t.estado, ((t._count / totalTratamientos) * 100).toFixed(2) + '%']))
  }

  const totalServicios = serviciosStats.reduce((acc, curr) => acc + curr._count, 0)
  const servicios = {
    total: totalServicios,
    porEstado: Object.fromEntries(serviciosStats.map(s => [s.estado, s._count])),
    porcentajePorEstado: Object.fromEntries(serviciosStats.map(s => [s.estado, ((s._count / totalServicios) * 100).toFixed(2) + '%'])),
  }

  const totalReservas = reservasStats.reduce((acc, curr) => acc + curr._count, 0)
  const reservas = {
    total: totalReservas,
    porEstado: Object.fromEntries(reservasStats.map(s => [s.estado, s._count])),
    porcentajePorEstado: Object.fromEntries(reservasStats.map(s => [s.estado, ((s._count / totalReservas) * 100).toFixed(2) + '%'])),
  }
  const totalPagos = pagosStats.reduce((acc, curr) => acc + curr._count, 0)
  const pagos = {
    total: totalPagos,
    porEstado: Object.fromEntries(
      Object.values([1, 2, 3]).map(estado => [
        estado,
        pagosStats.filter(p => p.estado === estado).reduce((acc, curr) => acc + curr._count, 0)
      ])
    ),
    porcentajePorEstado: Object.fromEntries(
      Object.values([1, 2, 3]).map(estado => [
        estado,
        ((pagosStats.filter(p => p.estado === estado).reduce((acc, curr) => acc + curr._count, 0) / totalPagos) * 100).toFixed(2) + '%'
      ])
    ),
    ayudaVoluntaria: pagosStats.filter(p => p.esAyudaVoluntaria === true).reduce((acc, curr) => acc + curr._count, 0),
    noAyudaVoluntaria: pagosStats.filter(p => p.esAyudaVoluntaria === false).reduce((acc, curr) => acc + curr._count, 0),
    porcentajeAyudaVoluntaria: ((pagosStats.filter(p => p.esAyudaVoluntaria === true).reduce((acc, curr) => acc + curr._count, 0) / totalPagos) * 100).toFixed(2) + '%',
    porcentajeNoAyudaVoluntaria: ((pagosStats.filter(p => p.esAyudaVoluntaria === false).reduce((acc, curr) => acc + curr._count, 0) / totalPagos) * 100).toFixed(2) + '%',
    porMetodo: Object.fromEntries(
      Object.values(MetodoPago).map(metodo => [
        metodo,
        pagosStats.filter(p => p.metodoPago === metodo).reduce((acc, curr) => acc + curr._count, 0)
      ])
    ),
    porcentajePorMetodo: Object.fromEntries(
      Object.values(MetodoPago).map(metodo => [
        metodo,
        ((pagosStats.filter(p => p.metodoPago === metodo).reduce((acc, curr) => acc + curr._count, 0) / totalPagos) * 100).toFixed(2) + '%'
      ])
    )
  }


  const totalMedicamentos = medicamentosStats.reduce((acc, curr) => acc + curr._count.id, 0)
  const medicamentos = {
    total: totalMedicamentos,
    porTipo: Object.fromEntries(medicamentosStats.map(m => [m.tipo, m._count.id])),
    porcentajePorTipo: Object.fromEntries(medicamentosStats.map(m => [m.tipo, ((m._count.id / totalMedicamentos) * 100).toFixed(2) + '%'])),
    conCodigo: medicamentosStats.reduce((acc, curr) => acc + curr._count.codigo, 0),
    porcentajeConCodigo: ((medicamentosStats.reduce((acc, curr) => acc + curr._count.codigo, 0) / totalMedicamentos) * 100).toFixed(2) + '%'
  }
  revalidatePath('/admin')
  
  return {
    usuarios,
    mascotas,
    historiales,
    tratamientos,
    pagos,
    medicamentos,
    servicios,
    reservas,
    servicioTratamientos: servicioTratamientoCount,
    tratamientoMedicamentos: tratamientoMedicamentoCount
  }
}


// import { startOfDay, endOfDay, subDays, format } from 'date-fns'

// export async function obtenerDatosEstadisticos() {
//   const hoy = new Date()
//   const hace90Dias = subDays(hoy, 90)

//   // Datos para el Grafico 1: Mascotas registradas y tratamientos por día
//   const mascotasRegistradas = await prisma.mascota.groupBy({
//     by: ['creadoEn'],
//     _count: { id: true },
//     where: {
//       creadoEn: { gte: hace90Dias, lte: hoy }
//     },
//     orderBy: { creadoEn: 'asc' }
//   })

//   const tratamientos = await prisma.tratamiento.groupBy({
//     by: ['creadoEn'],
//     _count: { id: true },
//     where: {
//       creadoEn: { gte: hace90Dias, lte: hoy }
//     },
//     orderBy: { creadoEn: 'asc' }
//   })

//   // Procesar los datos para que coincidan con el formato esperado por los componentes
//   const fechas = new Set([
//     ...mascotasRegistradas.map(item => format(item.creadoEn, 'yyyy-MM-dd')),
//     ...tratamientos.map(item => format(item.creadoEn, 'yyyy-MM-dd')),
//   ])

//   const datosGrafico1 = Array.from(fechas).map(fecha => {
//     const mascotasDelDia = mascotasRegistradas.find(item => format(item.creadoEn, 'yyyy-MM-dd') === fecha)
//     const tratamientosDelDia = tratamientos.find(item => format(item.creadoEn, 'yyyy-MM-dd') === fecha)
//     return {
//       date: fecha,
//       mascotas: mascotasDelDia?._count.id || 0,
//       tratamientos: tratamientosDelDia?._count.id || 0
//     }
//   }).sort((a, b) => a.date.localeCompare(b.date))

//   revalidatePath('/admin');

//   return {
//     datosGrafico1
//   }
// }


export async function obtenerDatosEstadisticos() {
  const hoy = new Date()
  const hace90Dias = subDays(hoy, 90)

  const [mascotasRegistradas, tratamientos, pagos, reservas] = await Promise.all([
    prisma.mascota.findMany({
      where: {
        creadoEn: { gte: hace90Dias, lte: hoy },
        estado: { not: 0 }
      },
      select: {
        creadoEn: true
      }
    }),
    prisma.tratamiento.findMany({
      where: {
        creadoEn: { gte: hace90Dias, lte: hoy },
        estado: { not: 0 }
      },
      select: {
        creadoEn: true
      }
    }),
    prisma.pago.findMany({
      where: {
        creadoEn: { gte: hace90Dias, lte: hoy },
        estado: 2
      },
      select: {
        creadoEn: true,
        total: true
      }
    }),
    prisma.reservaMedica.findMany({
      where: {
        creadoEn: { gte: hace90Dias, lte: hoy },
        estado: { not: 0 }
      },
      select: {
        creadoEn: true
      }
    })
  ])

  const fechas = new Set([
    ...mascotasRegistradas.map(item => format(item.creadoEn, 'yyyy-MM-dd')),
    ...tratamientos.map(item => format(item.creadoEn, 'yyyy-MM-dd')),
    ...pagos.map(item => format(item.creadoEn, 'yyyy-MM-dd')),
    ...reservas.map(item => format(item.creadoEn, 'yyyy-MM-dd')),
  ])

  const datosGrafico1 = Array.from(fechas).map(fecha => {
    const mascotasDelDia = mascotasRegistradas.filter(item => format(item.creadoEn, 'yyyy-MM-dd') === fecha).length
    const tratamientosDelDia = tratamientos.filter(item => format(item.creadoEn, 'yyyy-MM-dd') === fecha).length
    return {
      date: fecha,
      mascotas: mascotasDelDia,
      tratamientos: tratamientosDelDia
    }
  }).sort((a, b) => a.date.localeCompare(b.date))

  const datosGrafico2 = Array.from(fechas).map(fecha => {
    const pagosDelDia = pagos.filter(item => format(item.creadoEn, 'yyyy-MM-dd') === fecha)
    const totalIngresos = pagosDelDia.reduce((sum, pago) => sum.add(pago.total), new Decimal(0))
    const reservasDelDia = reservas.filter(item => format(item.creadoEn, 'yyyy-MM-dd') === fecha).length
    return {
      date: fecha,
      ingresos: totalIngresos.toNumber().toFixed(2),
      reservas: reservasDelDia
    }
  }).sort((a, b) => a.date.localeCompare(b.date))

  revalidatePath('/admin')

  return {
    datosGrafico1,
    datosGrafico2
  }
}