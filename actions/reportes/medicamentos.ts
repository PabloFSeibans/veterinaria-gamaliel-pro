"use server";

import prisma from "@/lib/prisma";
import { DatosReporteMedicamentos, FiltrosReporte, MedicamentoT } from "@/types/tiposreportes";
import { format, startOfDay, endOfDay, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { TipoMedicamento } from "@prisma/client";
import Decimal from "decimal.js";

const STOCK_BAJO_UMBRAL = 50;

export async function obtenerDatosMedicamentos(filtros: FiltrosReporte): Promise<DatosReporteMedicamentos> {
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

  // Consulta principal
  const medicamentosDB = await prisma.medicamento.findMany({
    where: {
      ...whereClause,
      estado: {
        not: 0,
      }
    },
    include: {
      tratamientos: {
        include: {
          tratamiento: {
            include: {
              historialMascota: {
                include: {
                  mascota: true
                }
              },
              pago: true
            }
          }
        }
      }
    },
    orderBy: [
      { estado: 'asc' },
      { nombre: 'asc' }
    ],
  });

  // Convertir a MedicamentoT[]
  const medicamentos: MedicamentoT[] = medicamentosDB.map(med => ({
    id: med.id,
    imagen: med.imagen,
    nombre: med.nombre,
    codigo: med.codigo,
    descripcion: med.descripcion,
    indicaciones: med.indicaciones,
    unidadMedida: med.unidadMedida,
    stock: med.stock,
    cantidadPorUnidad: med.cantidadPorUnidad,
    sobrante: med.sobrante,
    estado: med.estado,
    precio: Number(med.precio),
    tipo: med.tipo,
    creadoEn: med.creadoEn,
    actualizadoEn: med.actualizadoEn,
    idUsuario: med.idUsuario
  }));

  // Estadísticas básicas
  const totalMedicamentos = medicamentos.length;
  const medicamentosBajoStock = medicamentos.filter(m => m.stock < STOCK_BAJO_UMBRAL && m.estado === 1).length;
  const medicamentosAgotados = medicamentos.filter(m => m.stock === 0 || m.estado === 2).length;

  // Conteo por tipo
  const medicamentosPorTipo = Object.values(TipoMedicamento).map(tipo => ({
    tipo,
    cantidad: medicamentos.filter(m => m.tipo === tipo).length
  }));

  // Precio promedio por tipo
  const precioPromedioPorTipo = Object.values(TipoMedicamento).map(tipo => {
    const medicamentosTipo = medicamentos.filter(m => m.tipo === tipo);
    const promedio = medicamentosTipo.length > 0
      ? medicamentosTipo.reduce((acc, m) => acc + m.precio, 0) / medicamentosTipo.length
      : 0;
    return {
      tipo,
      precioPromedio: Number(promedio.toFixed(2))
    };
  });

  // Cantidad vendida por medicamento
  const totalCantidadVendidaPorMedicamento = medicamentosDB.map(med => ({
    nombre: med.nombre,
    cantidadVendida: med.tratamientos.reduce((acc, t) => acc + t.cantidad, 0)
  }));

  // Medicamentos más solicitados
  const medicamentosMasSolicitados = medicamentosDB
    .map(med => ({
      nombre: med.nombre,
      vecesUsado: med.tratamientos.length
    }))
    .sort((a, b) => b.vecesUsado - a.vecesUsado)
    .slice(0, 10);

  // Medicamentos más caros
  const medicamentosMasCaros = medicamentos
    .map(med => ({
      nombre: med.nombre,
      precio: med.precio
    }))
    .sort((a, b) => b.precio - a.precio)
    .slice(0, 10);

  // Datos para gráficos
  const stockPorMedicamento = medicamentos.map(med => ({
    nombre: med.nombre,
    stock: med.stock
  }));

  const medicamentosPorEstado = [
    { 
      estado: "En Stock",
      cantidad: medicamentos.filter(m => m.estado === 1).length
    },
    { 
      estado: "Agotado",
      cantidad: medicamentos.filter(m => m.estado === 2).length
    },
    { 
      estado: "Vencido",
      cantidad: medicamentos.filter(m => m.estado === 3).length
    }
  ];

  // Consumo por especie
  const consumoPorEspecie = medicamentosDB
    .flatMap(med => med.tratamientos
      .map(tm => ({
        especie: tm.tratamiento.historialMascota.mascota.especie,
        medicamento: med.nombre,
        vecesUsado: 1
      })))
    .reduce((acc: Array<{especie: string, medicamento: string, vecesUsado: number}>, item) => {
      const existente = acc.find(i => i.especie === item.especie && i.medicamento === item.medicamento);
      if (existente) {
        existente.vecesUsado += 1;
      } else {
        acc.push(item);
      }
      return acc;
    }, []);

  const cantidadVendidaPorMedicamento = medicamentosDB.map(med => ({
    nombre: med.nombre,
    cantidad: med.tratamientos.reduce((acc, tm) => acc + tm.cantidad, 0),
    precioTotalporCantidad: Number(med.tratamientos.reduce((acc, tm) => 
      acc + (tm.cantidad * Number(tm.costoUnitario)), 0).toFixed(2)) // Cambiado a precioTotalporCantidad
  }));

  return {
    medicamentos,
    estadisticas: {
      totalMedicamentos,
      medicamentosBajoStock,
      medicamentosAgotados,
      medicamentosPorTipo: Object.fromEntries(
        medicamentosPorTipo.map(({ tipo, cantidad }) => [tipo, cantidad])
      ),
      promedioPrecioPorTipo: Object.fromEntries(
        precioPromedioPorTipo.map(({ tipo, precioPromedio }) => [tipo, precioPromedio])
      ),
      totalCantidadVendidaPorMedicamento,
      medicamentosMasSolicitados,
      medicamentosMasCaros
    },
    graficos: {
      stockPorMedicamento,
      medicamentosPorTipo,
      medicamentosPorEstado,
      precioPromedioPorTipo,
      consumoPorEspecie,
      stockHistorico: [], // Se implementaría si se guarda historial
      cantidadVendidaPorMedicamento
    }
  };
}