// @/actions/reportes/mascotas.ts
"use server";

import prisma from "@/lib/prisma";
import { DatosReporteMascotas, FiltrosReporte, MascotaReporteT } from "@/types/tiposreportes";
import { format, differenceInYears, differenceInMonths, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Prisma } from "@prisma/client";

function calcularEdad(fechaNacimiento: Date | null): string {
  if (!fechaNacimiento) return "No registrada";
  const años = differenceInYears(new Date(), fechaNacimiento);
  if (años > 0) return `${años} ${años === 1 ? 'año' : 'años'}`;
  const meses = differenceInMonths(new Date(), fechaNacimiento);
  return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

export async function obtenerDatosMascotas(filtros: FiltrosReporte): Promise<DatosReporteMascotas> {
  let whereClause: Prisma.MascotaWhereInput = {};

  if (filtros.rangoFecha && filtros.rangoFechas?.from && filtros.rangoFechas?.to) {
    whereClause.creadoEn = {
      gte: startOfDay(new Date(filtros.rangoFechas.from)),
      lte: endOfDay(new Date(filtros.rangoFechas.to)),
    };
  }

  const mascotasDb = await prisma.mascota.findMany({
    where: {
      ...whereClause,
      estado: {
        not: 0
      }
    },
    include: {
      usuario: {
        select: {
          id: true,
          name: true,
          apellidoPat: true,
          apellidoMat: true,
          email: true,
          celular: true,
        },
      },
      historial: {
        include: {
          tratamientos: {
            orderBy: {
              creadoEn: 'desc'
            },
            take: 1,
          },
          _count: {
            select: { tratamientos: true }
          }
        },
      },
    },
    orderBy: {
      creadoEn: 'desc',
    },
  });

  // Convertir los datos y calcular estadísticas
  const mascotas: MascotaReporteT[] = mascotasDb.map(mascota => ({
    id: mascota.id,
    nombre: mascota.nombre,
    imagen: mascota.imagen,
    especie: mascota.especie,
    raza: mascota.raza,
    fechaNacimiento: mascota.fechaNacimiento,
    edad: calcularEdad(mascota.fechaNacimiento),
    sexo: mascota.sexo,
    detalles: mascota.detalles,
    peso: mascota.peso,
    estado: mascota.estado,
    esterilizado: mascota.esterilizado,
    creadoEn: mascota.creadoEn,
    actualizadoEn: mascota.actualizadoEn,
    propietario: mascota.usuario ? {
      id: mascota.usuario.id,
      name: mascota.usuario.name,
      apellidoPat: mascota.usuario.apellidoPat,
      apellidoMat: mascota.usuario.apellidoMat,
      email: mascota.usuario.email,
      celular: mascota.usuario.celular,
    } : null,
    historial: mascota.historial ? {
      estado: mascota.historial.estado,
      descripcionTratamientos: mascota.historial.descripcionTratamientos,
      cantidadTratamientos: mascota.historial._count.tratamientos,
      ultimoTratamiento: mascota.historial.tratamientos[0] || undefined,
    } : undefined,
  }));

  // Estadísticas básicas
  const totalMascotas = mascotas.length;
  const mascotasRegistradas = mascotas.filter(m => m.estado === 1).length;
  const mascotasAtendidas = mascotas.filter(m => m.estado === 2).length;
  const mascotasEnTratamiento = mascotas.filter(m => m.estado === 3).length;
  const mascotasAltaMedica = mascotas.filter(m => m.estado === 4).length;
  const mascotasInternadas = mascotas.filter(m => m.estado === 5).length;
  const mascotasFallecidas = mascotas.filter(m => m.estado === 6).length;
  
  const mascotasEsterilizadas = mascotas.filter(m => m.esterilizado === true).length;
  const totalMachos = mascotas.filter(m => m.sexo === 'Macho').length;
  const totalHembras = mascotas.filter(m => m.sexo === 'Hembra').length;

  // Calcular promedios
  const mascotasConFechaNacimiento = mascotas.filter(m => m.fechaNacimiento);
  const edadPromedio = mascotasConFechaNacimiento.length > 0
    ? mascotasConFechaNacimiento.reduce((sum, m) => 
        sum + differenceInMonths(new Date(), m.fechaNacimiento!), 0) / mascotasConFechaNacimiento.length / 12
    : 0;

  const mascotasConPeso = mascotas.filter(m => m.peso !== null);
  const pesoPromedio = mascotasConPeso.length > 0
    ? mascotasConPeso.reduce((sum, m) => sum + (m.peso || 0), 0) / mascotasConPeso.length
    : 0;

  // Conteo por especie
  const totalPerros = mascotas.filter(m => m.especie === 'Perro').length;
  const totalGatos = mascotas.filter(m => m.especie === 'Gato').length;
  const totalOtros = mascotas.filter(m => m.especie === 'Otro').length;

  // Estadísticas de tratamientos
  const mascotasConTratamientos = mascotas.filter(m => (m.historial?.cantidadTratamientos || 0) > 0).length;
  const totalTratamientos = mascotas.reduce((sum, m) => sum + (m.historial?.cantidadTratamientos || 0), 0);
  const promedioTratamientosPorMascota = totalMascotas > 0 ? totalTratamientos / totalMascotas : 0;

  // Datos para gráficos
  const mascotasPorEstado = [
    { estado: 'Registradas', cantidad: mascotasRegistradas },
    { estado: 'Atendidas', cantidad: mascotasAtendidas },
    { estado: 'En Tratamiento', cantidad: mascotasEnTratamiento },
    { estado: 'Dados de Alta', cantidad: mascotasAltaMedica },
    { estado: 'Internadas', cantidad: mascotasInternadas },
    { estado: 'Fallecidas', cantidad: mascotasFallecidas },
  ];

  const mascotasPorEspecie = [
    { especie: 'Perros', cantidad: totalPerros },
    { especie: 'Gatos', cantidad: totalGatos },
    { especie: 'Otros', cantidad: totalOtros },
  ];

  const mascotasPorSexo = [
    { sexo: 'Machos', cantidad: totalMachos },
    { sexo: 'Hembras', cantidad: totalHembras },
  ];

  // Rangos de edad
  const mascotasPorEdad = [
    { rango: '0-1 año', cantidad: 0 },
    { rango: '1-3 años', cantidad: 0 },
    { rango: '3-7 años', cantidad: 0 },
    { rango: '7+ años', cantidad: 0 },
  ];

  mascotasConFechaNacimiento.forEach(mascota => {
    const edad = differenceInYears(new Date(), mascota.fechaNacimiento!);
    if (edad <= 1) mascotasPorEdad[0].cantidad++;
    else if (edad <= 3) mascotasPorEdad[1].cantidad++;
    else if (edad <= 7) mascotasPorEdad[2].cantidad++;
    else mascotasPorEdad[3].cantidad++;
  });

  // Rangos de peso
  const mascotasPorPeso = [
    { rango: '0-5 kg', cantidad: 0 },
    { rango: '5-15 kg', cantidad: 0 },
    { rango: '15-30 kg', cantidad: 0 },
    { rango: '30+ kg', cantidad: 0 },
  ];

  mascotasConPeso.forEach(mascota => {
    const peso = mascota.peso!;
    if (peso <= 5) mascotasPorPeso[0].cantidad++;
    else if (peso <= 15) mascotasPorPeso[1].cantidad++;
    else if (peso <= 30) mascotasPorPeso[2].cantidad++;
    else mascotasPorPeso[3].cantidad++;
  });

  // Top 10 mascotas por cantidad de tratamientos
  const topMascotasTratamientos = mascotas
    .filter(m => (m.historial?.cantidadTratamientos || 0) > 0)
    .map(m => ({
      nombreMascota: m.nombre,
      cantidadTratamientos: m.historial!.cantidadTratamientos,
      nombrePropietario: m.propietario 
        ? `${m.propietario.name} ${m.propietario.apellidoPat || ''}`.trim()
        : 'Sin propietario'
    }))
    .sort((a, b) => b.cantidadTratamientos - a.cantidadTratamientos)
    .slice(0, 10);

  // Distribución de esterilizados
  const distribucionEsterilizados = [
    { estado: 'Esterilizados', cantidad: mascotasEsterilizadas },
    { estado: 'No Esterilizados', cantidad: totalMascotas - mascotasEsterilizadas },
  ];

  // Mascotas nuevas por mes
  const mascotasNuevasPorMes = new Map<string, number>();
  mascotas.forEach(m => {
    const mes = format(m.creadoEn, 'MMMM yyyy', { locale: es });
    mascotasNuevasPorMes.set(mes, (mascotasNuevasPorMes.get(mes) || 0) + 1);
  });

  return {
    mascotas,
    estadisticas: {
      totalMascotas,
      mascotasRegistradas,
      mascotasAtendidas,
      mascotasEnTratamiento,
      mascotasAltaMedica,
      mascotasInternadas,
      mascotasFallecidas,
      mascotasEsterilizadas,
      totalMachos,
      totalHembras,
      edadPromedio,
      pesoPromedio,
      totalPerros,
      totalGatos,
      totalOtros,
      mascotasConTratamientos,
      promedioTratamientosPorMascota,
    },
    graficos: {
      mascotasPorEstado,
      mascotasPorEspecie,
      mascotasPorSexo,
      mascotasPorEdad,
      mascotasPorPeso,
      topMascotasTratamientos,
      distribucionEsterilizados,
      mascotasNuevasPorMes: Array.from(mascotasNuevasPorMes.entries()).map(([mes, cantidad]) => ({
        mes,
        cantidad
      })),
    },
    tablas: {
      mascotasEnTratamiento: mascotas.filter(m => m.estado === 3),
      mascotasNuevas: mascotas.filter(m => m.estado === 1),
      mascotasInternadas: mascotas.filter(m => m.estado === 6),
    },
  };
}
