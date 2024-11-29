//@/types/tiposreportes.ts
import { RolUsuario, Sexo, TipoMascota, TipoMedicamento, MetodoPago } from "@prisma/client";

// Interfaces base para estadísticas
export interface EstadisticasBase {
  totalRegistros: number;
  registrosActivos: number;
  registrosInactivos: number;
  ultimoRegistro: Date;
  primerRegistro: Date;
}

// Interfaces para Pagos
export interface DatosPago {
  id: number;
  fecha: string;
  total: number;
  metodoPago: string;
  detalle: string;
  estado: number;
  tratamientoId: number;
}

export interface EstadisticasPago extends EstadisticasBase {
  totalIngresos: number;
  promedioIngreso: number;
  totalPendientes: number;
  totalPagados: number;
  totalCancelados: number;
}

export interface GraficosPago {
  ingresosMensuales: {
    mes: string;
    monto: number;
  }[];
  distribucionMetodos: {
    metodo: string;
    cantidad: number;
    porcentaje: number;
  }[];
  estadosPago: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
}

// Interfaces para Tratamientos
export interface DatosTratamiento {
  id: number;
  fecha: string;
  descripcion: string;
  diagnostico: string | null;
  estado: number;
  mascotaId: number;
  nombreMascota: string;
  propietario: string;
  servicios: string[];
  medicamentos: string[];
  total: number;
}

export interface EstadisticasTratamiento extends EstadisticasBase {
  promedioServicios: number;
  promedioMedicamentos: number;
  costoPromedio: number;
  tratamientosPorMascota: number;
}

export interface GraficosTratamiento {
  tratamientosPorMes: {
    mes: string;
    cantidad: number;
  }[];
  distribucionEstados: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
  serviciosMasUsados: {
    servicio: string;
    cantidad: number;
    porcentaje: number;
  }[];
  medicamentosMasUsados: {
    medicamento: string;
    cantidad: number;
    porcentaje: number;
  }[];
}

// Interfaces para Mascotas
export interface DatosMascota {
  id: number;
  nombre: string;
  especie: TipoMascota;
  raza: string | null;
  sexo: Sexo;
  edad: string | null;
  peso: number | null;
  propietario: string;
  estado: number;
  tratamientos: number;
}

export interface EstadisticasMascota extends EstadisticasBase {
  promedioEdad: number;
  promedioPeso: number;
  distribucionEspecies: {
    especie: string;
    cantidad: number;
    porcentaje: number;
  }[];
}

export interface GraficosMascota {
  mascotasPorMes: {
    mes: string;
    cantidad: number;
  }[];
  distribucionEstados: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
  distribucionEspecies: {
    especie: string;
    cantidad: number;
    porcentaje: number;
  }[];
  distribucionSexo: {
    sexo: string;
    cantidad: number;
    porcentaje: number;
  }[];
}

// Interfaces para Medicamentos
export interface DatosMedicamento {
  id: number;
  nombre: string;
  codigo: string | null;
  tipo: TipoMedicamento;
  stock: number;
  precio: number;
  estado: number;
  usosTotales: number;
}

export interface EstadisticasMedicamento extends EstadisticasBase {
  valorInventario: number;
  stockPromedio: number;
  medicamentosSinStock: number;
  medicamentosBajoStock: number;
}

export interface GraficosMedicamento {
  stockPorTipo: {
    tipo: string;
    cantidad: number;
  }[];
  usosPorMes: {
    mes: string;
    cantidad: number;
  }[];
  valorPorTipo: {
    tipo: string;
    valor: number;
    porcentaje: number;
  }[];
}

// Interfaces para Servicios
export interface DatosServicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  estado: number;
  usosTotales: number;
  ingresoTotal: number;
}

export interface EstadisticasServicio extends EstadisticasBase {
  precioPromedio: number;
  ingresoTotal: number;
  serviciosMasUsados: {
    servicio: string;
    usos: number;
    porcentaje: number;
  }[];
}

export interface GraficosServicio {
  usosPorMes: {
    mes: string;
    cantidad: number;
  }[];
  ingresosPorServicio: {
    servicio: string;
    ingreso: number;
    porcentaje: number;
  }[];
}

// Interfaces para Reservas
export interface DatosReserva {
  id: number;
  fecha: string;
  detalles: string;
  estado: number;
  usuario: string;
  rol: RolUsuario;
}

export interface EstadisticasReserva extends EstadisticasBase {
  reservasPorDia: number;
  tiempoPromedioAtencion: number;
  reservasCanceladas: number;
}

export interface GraficosReserva {
  reservasPorMes: {
    mes: string;
    cantidad: number;
  }[];
  distribucionEstados: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
  distribucionHoraria: {
    hora: string;
    cantidad: number;
  }[];
}

// Interfaces para Usuarios
export interface DatosUsuario {
  id: number;
  nombre: string;
  email: string | null;
  rol: RolUsuario;
  estado: number;
  mascotas: number;
  reservas: number;
  ultimoAcceso: string | null;
}

export interface EstadisticasUsuario extends EstadisticasBase {
  promedioMascotasPorUsuario: number;
  usuariosVerificados: number;
  usuariosNoVerificados: number;
}

export interface GraficosUsuario {
  usuariosPorMes: {
    mes: string;
    cantidad: number;
  }[];
  distribucionRoles: {
    rol: string;
    cantidad: number;
    porcentaje: number;
  }[];
  estadosUsuario: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
}

// Interfaces para Historiales
export interface DatosHistorial {
  id: number;
  mascota: string;
  propietario: string;
  fechaCreacion: string;
  estado: number;
  tratamientos: number;
  ultimoTratamiento: string | null;
}

export interface EstadisticasHistorial extends EstadisticasBase {
  promedioTratamientosPorHistorial: number;
  historialesActivos: number;
  historialesInactivos: number;
}

export interface GraficosHistorial {
  historialesPorMes: {
    mes: string;
    cantidad: number;
  }[];
  distribucionEstados: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
  tratamientosPorHistorial: {
    rango: string;
    cantidad: number;
  }[];
}

// Tipo para todos los datos posibles
export type DatosReporte =
  | DatosPago[]
  | DatosTratamiento[]
  | DatosMascota[]
  | DatosMedicamento[]
  | DatosServicio[]
  | DatosReserva[]
  | DatosUsuario[]
  | DatosHistorial[];

// Tipo para todas las estadísticas posibles
export type EstadisticasReporte =
  | EstadisticasPago
  | EstadisticasTratamiento
  | EstadisticasMascota
  | EstadisticasMedicamento
  | EstadisticasServicio
  | EstadisticasReserva
  | EstadisticasUsuario
  | EstadisticasHistorial;

// Tipo para todos los gráficos posibles
export type GraficosReporte =
  | GraficosPago
  | GraficosTratamiento
  | GraficosMascota
  | GraficosMedicamento
  | GraficosServicio
  | GraficosReserva
  | GraficosUsuario
  | GraficosHistorial;

// Interfaz para la respuesta completa del reporte
export interface RespuestaReporte {
  datos: DatosReporte;
  estadisticas: EstadisticasReporte;
  graficos: GraficosReporte;
  filtros: FiltrosReporte;
}


































































// Interfaz para los filtros del reporte
export interface FiltrosReporte {
  rangoFecha: boolean;
  rangoFechas?: {
    from?: Date;
    to?: Date;
  };
  logo: boolean;
  estadisticas: boolean;
  graficos: boolean;
  tabla: boolean;
}

export interface DatosReporteReservas {
  reservas: ReservaMedicaT[];
  estadisticas: {
    totalReservas: number;
    reservasPendientes: number;
    reservasCompletadas: number;
    reservasCanceladas: number;
    reservasPorUsuario: Record<string, number>;
  };
  graficos: {
    reservasPorFecha: Array<{ fecha: string; cantidad: number }>;
    reservasPorEstado: Array<{ estado: string; cantidad: number }>;
    reservasPorHora: Array<{ hora: string; cantidad: number }>;
    reservasPorDiaSemana: Array<{ dia: string; cantidad: number }>;
  };
}

export interface ReservaMedicaT {
  id: number;
  fechaReserva: Date;
  estado: number;
  detalles: string;
  usuario: {
    name: string;
    apellidoPat: string | null;
    apellidoMat: string | null;
  };
}

export interface UsuarioReporteT {
  id: number;
  name: string;
  apellidoPat: string | null;
  apellidoMat: string | null;
  email: string | null;
  rol: string;
  estado: number;
  emailVerified: Date | null;
  authDobleFactor: boolean;
  createdAt: Date;
}

export interface DatosReporteUsuarios {
  usuarios: {
    conPagosPendientes: UsuarioReporteExtendidoT[];
    sinPagosPendientes: UsuarioReporteExtendidoT[];
  };
  estadisticas: {
    totalUsuarios: number;
    usuariosActivos: number;
    usuariosInactivos: number;
    usuariosPorRol: Record<string, number>;
    usuariosConPagosPendientes: number;
    totalPagosRecibidos: string;
    usuariosVerificados: number;
    usuariosNoVerificados: number;
  };
  graficos: {
    usuariosPorRol: Array<{ rol: string; cantidad: number }>;
    usuariosPorEstado: Array<{ estado: string; cantidad: number }>;
    usuariosPorVerificacion: Array<{ estado: string; cantidad: number }>;
    clientesFrecuentes: Array<{
      nombre: string;
      cantidadMascotas: number;
      cantidadTratamientos: number;
      totalPagado: string;
    }>;
    distribucionPagos: Array<{
      estado: string;
      cantidad: number;
      total: string;
    }>;
  };
}

export interface UsuarioReporteExtendidoT extends UsuarioReporteT {
  cantidadMascotas: number;
  cantidadTratamientos: number;
  pagosPendientes: number;
  totalPagado: string;
}


// export interface TratamientoReporteT {
//   id: number;
//   descripcion: string;
//   estado: number;
//   diagnostico: string | null;
//   historialMascotaId: number;
//   creadoEn: Date;
//   actualizadoEn: Date | null; 
//   pago: {
//     total: string;
//     estado: number;
//     fechaPago: Date | null;
//   } | null;
//   medicamentos: Array<{
//     medicamentoId: number;
//     nombre: string;
//     cantidad: number;
//     costoUnitario: string;
//   }>;
//   servicios: Array<{
//     servicioId: number;
//     nombre: string;
//     precioServicio: string;
//   }>;
//   mascota: {
//     nombre: string;
//     especie: string;
//     propietario: {
//       name: string;
//       apellidoPat: string | null;
//       apellidoMat: string | null;
//     };
//   };
// }


export interface TratamientoReporteT {
  id: number;
  descripcion: string;
  estado: number;
  diagnostico: string | null;
  historialMascotaId: number;
  creadoEn: Date;
  actualizadoEn: Date | null;
  idUsuario: number;
  mascota: {
    id: number;
    nombre: string;
    especie: TipoMascota;
    usuario: {
      name: string;
      apellidoPat: string | null;
      apellidoMat: string | null;
    } | null;
  };
  veterinario: {
    id: number;
    name: string;
    apellidoPat: string | null;
    apellidoMat: string | null;
    rol: RolUsuario;
  };
  totalMedicamentos: number;
  totalServicios: number;
  costoTotal: string;
}

export interface DatosReporteTratamientos {
  tratamientos: TratamientoReporteT[];
  estadisticas: {
    totalTratamientos: number;
    tratamientosEnProgreso: number;
    tratamientosCompletados: number;
    tratamientosCancelados: number;
    promedioMedicamentosPorTratamiento: number;
    promedioServiciosPorTratamiento: number;
    ingresosTotales: string;
    porcentajeEfectividad: number;
  };
  graficos: {
    tratamientosPorEstado: Array<{ estado: string; cantidad: number }>;
    tratamientosPorEspecie: Array<{ especie: string; cantidad: number }>;
    ingresosPorMes: Array<{ mes: string; ingresos: number }>;
    medicamentosMasUsados: Array<{ nombre: string; cantidad: number }>;
    serviciosMasRequeridos: Array<{ nombre: string; cantidad: number }>;
    tratamientosPorVeterinario: Array<{
      veterinario: string;
      cantidad: number;
      ingresos: string;
      efectividad: number;
    }>;
    //     distribucionPagos: Array<{ estado: string; cantidad: number }>;
    //     tratamientosPorEspecie: Record<string, number>;
    //     tratamientosPorVeterinario: Array<{ veterinario: string; cantidad: number }>;
  };
}





















export interface DatosReporteMedicamentos {
  medicamentos: MedicamentoT[]; // Array principal de medicamentos con todos sus campos

  estadisticas: {
    totalMedicamentos: number;
    medicamentosBajoStock: number; // Medicamentos con stock bajo (umbral configurable)
    medicamentosAgotados: number; // Medicamentos sin stock
    medicamentosPorTipo: Record<string, number>; // Cantidad de medicamentos por tipo
    promedioPrecioPorTipo: Record<string, number>; // Promedio de precio de cada tipo de medicamento
    totalCantidadVendidaPorMedicamento: Array<{ nombre: string; cantidadVendida: number }>; // Total de cantidad vendida por medicamento
    medicamentosMasSolicitados: Array<{ nombre: string; vecesUsado: number }>; // Medicamentos más solicitados en tratamientos
    medicamentosMasCaros: Array<{ nombre: string; precio: number }>; // Lista de los medicamentos más caros
  };

  graficos: {
    stockPorMedicamento: Array<{ nombre: string; stock: number }>; // Medicamentos con su stock actual
    medicamentosPorTipo: Array<{ tipo: string; cantidad: number }>; // Conteo de medicamentos por tipo
    medicamentosPorEstado: Array<{ estado: string; cantidad: number }>; // Conteo por estado (en stock, agotado, vencido)
    precioPromedioPorTipo: Array<{ tipo: string; precioPromedio: number }>; // Precio promedio por cada tipo
    consumoPorEspecie: Array<{ especie: string; medicamento: string; vecesUsado: number }>; // Consumo agrupado por especie de mascota
    stockHistorico: Array<{ mes: string; nombre: string; stock: number }>; // Histórico de stock por medicamento y mes
    cantidadVendidaPorMedicamento: Array<{ nombre: string; cantidad: number, precioTotalporCantidad: number }>; // Cantidad total vendida por medicamento
  };
}

export interface MedicamentoT {
  id: number;
  imagen: string | null;
  nombre: string;
  codigo: string | null;
  descripcion: string | null;
  indicaciones: string | null;
  unidadMedida: string | null;
  stock: number;
  cantidadPorUnidad: number;
  sobrante: number;
  estado: number;
  precio: number;
  tipo: TipoMedicamento;
  creadoEn: Date;
  actualizadoEn?: Date | null;
  idUsuario: number;
}

// Interfaces para el reporte de Servicios
export interface DatosReporteServicios {
  servicios: ServicioReporteT[];
  estadisticas: {
    totalServicios: number;
    serviciosActivos: number;
    serviciosInactivos: number;
    promedioPrecios: number;
    serviciosMasUtilizados: Array<{ nombre: string; usos: number }>;
    ingresosTotales: number;
  };
  graficos: {
    serviciosPorEstado: Array<{ estado: string; cantidad: number }>;
    serviciosPorPrecio: Array<{ nombre: string; precio: number }>;
    serviciosPorUso: Array<{ nombre: string; usos: number }>;
    ingresosPorServicio: Array<{ nombre: string; ingresos: number }>;
    tendenciaUsoServicios: Array<{ mes: string; usos: number }>;
  };
}

export interface ServicioReporteT {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  estado: number;
  creadoEn: Date;
  usos: number;
  ingresos: number;
}

export interface DatosReportePagos {
  pagos: PagoReporteT[];
  estadisticas: {
    totalPagos: number;
    pagosPendientes: number;
    pagosCompletados: number;
    pagosCancelados: number;
    totalIngresos: string;
    promedioIngresos: string;
    totalAyudaVoluntaria: string;
    pagosEfectivo: number;
    pagosTransferencia: number;
    pagosTarjeta: number;
    pagosQr: number;
    pagosOtro: number;
  };
  graficos: {
    pagosPorEstado: Array<{ estado: string; cantidad: number }>;
    pagosPorMetodo: Array<{ metodo: string; cantidad: number }>;
    ingresosPorMes: Array<{ mes: string; ingresos: number }>;
    pagosPorDia: Array<{ dia: string; cantidad: number }>;
    distribucionAyudaVoluntaria: Array<{ tipo: string; total: string }>;
    topClientesPagos: Array<{
      nombreCliente: string;
      cantidadPagos: number;
      totalPagado: string;
    }>;
  };
}

export interface PagoReporteT {
  id: number;
  total: string;
  fechaPago: Date | null;
  metodoPago: MetodoPago | null;
  detalle: string | null;
  estado: number;
  esAyudaVoluntaria: boolean;
  creadoEn: Date;
  actualizadoEn: Date | null;
  idUsuario: number;
  tratamiento: {
    id: number;
    descripcion: string;
    estado: number;
    historialMascota: {
      mascota: {
        id: number;
        nombre: string;
        especie: TipoMascota;
        usuario: {
          id: number;
          name: string;
          apellidoPat: string | null;
          apellidoMat: string | null;
          email: string | null;
        } | null;
      };
    };
  };
}

export interface DatosReporteMascotas {
  mascotas: MascotaReporteT[];
  estadisticas: {
    totalMascotas: number;
    mascotasRegistradas: number;
    mascotasAtendidas: number;
    mascotasEnTratamiento: number;
    mascotasAltaMedica: number;
    mascotasInternadas: number;
    mascotasFallecidas: number;
    mascotasEsterilizadas: number;
    totalMachos: number;
    totalHembras: number;
    edadPromedio: number;
    pesoPromedio: number;
    totalPerros: number;
    totalGatos: number;
    totalOtros: number;
    mascotasConTratamientos: number;
    promedioTratamientosPorMascota: number;
  };
  graficos: {
    mascotasPorEstado: Array<{ estado: string; cantidad: number }>;
    mascotasPorEspecie: Array<{ especie: string; cantidad: number }>;
    mascotasPorSexo: Array<{ sexo: string; cantidad: number }>;
    mascotasPorEdad: Array<{ rango: string; cantidad: number }>;
    mascotasPorPeso: Array<{ rango: string; cantidad: number }>;
    topMascotasTratamientos: Array<{
      nombreMascota: string;
      cantidadTratamientos: number;
      nombrePropietario: string;
    }>;
    distribucionEsterilizados: Array<{ estado: string; cantidad: number }>;
    mascotasNuevasPorMes: Array<{ mes: string; cantidad: number }>;
  };
  tablas: {
    mascotasEnTratamiento: MascotaReporteT[];
    mascotasNuevas: MascotaReporteT[];
    mascotasInternadas: MascotaReporteT[];
  };
}

export interface MascotaReporteT {
  id: number;
  nombre: string;
  imagen: string | null;
  especie: TipoMascota;
  raza: string | null;
  fechaNacimiento: Date | null;
  edad?: string;
  sexo: Sexo;
  detalles: string | null;
  peso: number | null;
  estado: number;
  esterilizado: boolean | null;
  creadoEn: Date;
  actualizadoEn: Date | null;
  propietario: {
    id: number;
    name: string;
    apellidoPat: string | null;
    apellidoMat: string | null;
    email: string | null;
    celular: string | null;
  } | null;
  historial?: {
    estado: number;
    descripcionTratamientos: string | null;
    cantidadTratamientos: number;
    ultimoTratamiento?: {
      descripcion: string;
      estado: number;
      creadoEn: Date;
    };
  };
}


export interface ServicioReporteT {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  estado: number;
  creadoEn: Date;
  actualizadoEn: Date | null;
  idUsuario: number;
  tratamientos: {
    tratamientoId: number;
    precioServicio: string;
    tratamiento: {
      estado: number;
      historialMascota: {
        mascota: {
          nombre: string;
          especie: TipoMascota;
          usuario: {
            name: string;
            apellidoPat: string | null;
            apellidoMat: string | null;
          } | null;
        };
      };
    };
  }[];
}

export interface DatosReporteServicios {
  servicios: ServicioReporteT[];
  estadisticas: {
    totalServicios: number;
    serviciosActivos: number;
    serviciosInactivos: number;
    promedioPrecios: number;
    serviciosMasUtilizados: Array<{
      nombre: string;
      usos: number;
    }>;
    ingresosTotales: number;
  };
  graficos: {
    serviciosPorEstado: Array<{
      estado: string;
      cantidad: number;
    }>;
    serviciosPorPrecio: Array<{
      nombre: string;
      precio: number;
    }>;
    serviciosPorUso: Array<{
      nombre: string;
      usos: number;
    }>;
    ingresosPorServicio: Array<{
      nombre: string;
      ingresos: number;
    }>;
    tendenciaUsoServicios: Array<{
      mes: string;
      usos: number;
    }>;
  };
}

export interface DatosReporteHistoriales {
  historiales: HistorialMedicoReporteT[];
  estadisticas: {
    totalHistoriales: number;
    historialesNuevos: number;
    historialesConTratamientoPendiente: number;
    historialesConTratamientosRealizados: number;
    historialesArchivados: number;
    promedioTratamientosPorHistorial: number;
    promedioMedicamentosPorTratamiento: number;
    promedioServiciosPorTratamiento: number;
    mascotasConMasTratamientos: Array<{ nombre: string; cantidad: number }>;
  };
  graficos: {
    historialesPorEstado: Array<{ estado: string; cantidad: number }>;
    historialesPorEspecie: Array<{ especie: string; cantidad: number }>;
    tratamientosPorMes: Array<{ mes: string; cantidad: number }>;
    top10MedicamentosUsados: Array<{ nombre: string; cantidad: number }>;
    top10ServiciosSolicitados: Array<{ nombre: string; cantidad: number }>;
    distribucionEdadMascotas: Array<{ rango: string; cantidad: number }>;
  };
}

export interface HistorialMedicoReporteT {
  historialMascotaId: number;
  descripcionTratamientos: string | null;
  estado: number;
  creadoEn: Date;
  actualizadoEn: Date | null;
  mascota: {
    id: number;
    nombre: string;
    especie: TipoMascota;
    raza: string | null;
    fechaNacimiento: Date | null;
    sexo: Sexo;
    peso: number | null;
    esterilizado: boolean | null;
    propietario: {
      id: number;
      name: string;
      apellidoPat: string | null;
      apellidoMat: string | null;
      email: string | null;
    } | null;
  };
  tratamientos: Array<{
    id: number;
    descripcion: string;
    estado: number;
    diagnostico: string | null;
    creadoEn: Date;
    actualizadoEn: Date | null;
    veterinario: {
      id: number;
      name: string;
      apellidoPat: string | null;
      apellidoMat: string | null;
      rol: RolUsuario;
    };
    medicamentos: Array<{
      nombre: string;
      cantidad: number;
      costoUnitario: string;
    }>;
    servicios: Array<{
      nombre: string;
      precioServicio: string;
    }>;
  }>;
}