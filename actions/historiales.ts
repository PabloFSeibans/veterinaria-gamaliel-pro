// actions/historiales.ts
"use server";
import prisma from "@/lib/prisma"
import { HistorialMedicoCompleto, HistorialMedicoVistaT, TratamientoCompleto } from "@/types";
import { formatearFechaYHora } from '@/lib/formatearFecha';
import { put } from '@vercel/blob';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

export const obtenerTodosHistorialesConMascotas = async (): Promise<{ historiales: HistorialMedicoVistaT[] } | { error: string }> => {
  try {
    const historiales = await prisma.historialMedico.findMany({
      where: {
        estado:{
          not: 0
        }
      },
      include: {
        mascota: {
          select: {
            nombre: true,
            sexo: true,
            imagen: true,
            especie: true,
            raza: true,
            estado: true,
            usuario: {
              select: {
                name: true,
                email: true,
                image: true,
                celular: true,
                direccion: true,
              },
            },
          },
        },
        tratamientos: {
          select: {
            id: true,
            descripcion: true,
            creadoEn: true,
            actualizadoEn: true,
            idUsuario: true,
          },
        },
      },
    });

    const historialesConMascotas: HistorialMedicoVistaT[] = historiales.map(historial => ({
      historialMascotaId: historial.historialMascotaId,
      estado: historial.estado,
      creadoEn: historial.creadoEn,
      actualizadoEn: historial.actualizadoEn,
      nombreMascota: historial.mascota.nombre,
      imagenMascota: historial.mascota.imagen ?? null,
      especieMascota: historial.mascota.especie,
      razaMascota: historial.mascota.raza ?? null,
      sexoMascota: historial.mascota.sexo,
      estadoMascota: historial.mascota.estado,
      nombrePropietario: historial.mascota.usuario?.name ?? null,
      emailPropietario: historial.mascota.usuario?.email ?? null,
      imagenPropietario: historial.mascota.usuario?.image ?? null,
      celularPropietario: historial.mascota.usuario?.celular ?? null,
      direccionPropietario: historial.mascota.usuario?.direccion ?? null,
      tratamientos: historial.tratamientos.map(tratamiento => ({
        id: tratamiento.id,
        descripcion: tratamiento.descripcion,
        creadoEn: tratamiento.creadoEn,
        actualizadoEn: tratamiento.actualizadoEn,
        idUsuario: tratamiento.idUsuario,
      })),
    }));

    return { historiales: historialesConMascotas };
  } catch (error) {
    console.error("Error al obtener todos los historiales médicos:", error);
    return { error: "Ocurrió un error al obtener los historiales médicos." };
  }
};

export async function obtenerHistorialconMascotayUsuario(historialId: number): Promise<HistorialMedicoCompleto | null> {
  try {
    const historial = await prisma.historialMedico.findUnique({
      where: { historialMascotaId: historialId, estado: {not:0} },
      select: {
        historialMascotaId: true,
        descripcionTratamientos: true,
        estado: true,
        creadoEn: true,
        actualizadoEn: true,
        idUsuario: true,
        mascota: {
          select: {
            id: true,
            nombre: true,
            imagen: true,
            especie: true,
            raza: true,
            fechaNacimiento: true,
            sexo: true,
            detalles: true,
            peso: true,
            estado: true,
            idPropietario: true,
            esterilizado: true,
            creadoEn: true,
            actualizadoEn: true,
            idUsuario: true,
            usuario: {
              select: {
                id: true,
                name: true,
                apellidoPat: true,
                apellidoMat: true,
                ci: true,
                rol: true,
                sexo: true,
                email: true,
                emailVerified: true,
                image: true,
                celular: true,
                direccion: true,
                estado: true,
                authDobleFactor: true,
                createdAt: true,
                updatedAt: true,
                idUsuario: true,
              }
            }
          }
        },
        tratamientos: {
          select: {
            id: true,
            descripcion: true,
            estado: true,
            diagnostico: true,
            historialMascotaId: true,
            creadoEn: true,
            actualizadoEn: true,
            idUsuario: true,
            servicios: {
              select: {
                precioServicio: true,
                servicioId: true,
                servicio: {
                  select: {
                    id: true,
                    nombre: true,
                    descripcion: true,
                    precio: true,
                    creadoEn: true,
                    actualizadoEn: true,
                    idUsuario: true,
                  }
                }
              }
            },
            medicamentos: {
              select: {
                cantidad: true,
                costoUnitario: true,
                dosificacion: true,
                medicamentoId: true,
                medicamento: {
                  select: {
                    id: true,
                    nombre: true,
                    imagen: true,
                    codigo: true,
                    descripcion: true,
                    indicaciones: true,
                    unidadMedida: true,
                    stock: true,
                    cantidadPorUnidad: true,
                    sobrante: true,
                    estado: true,
                    precio: true,
                    tipo: true,
                    creadoEn: true,
                    actualizadoEn: true,
                    idUsuario: true,
                  }
                }
              }
            },
            pago: {
              select: {
                id: true,
                total: true,
                fechaPago: true,
                detalle: true,
                estado: true,
                esAyudaVoluntaria: true,
              }
            }
          },
          where: {
            estado: { not: 0 }
          }
        }
      }
    });


    if (!historial) {
      return null;
    }

    // Convertir los campos Decimal a string para que coincidan con las interfaces
    const historialFormateado: any = {
      ...historial,
      mascota: {
        ...historial.mascota,
        usuario: historial.mascota.usuario ? {
          ...historial.mascota.usuario,
        } : null
      },
      tratamientos: historial.tratamientos.map(tratamiento => ({
        ...tratamiento,
        servicios: tratamiento.servicios.map(servicio => ({
          ...servicio,
          precioServicio: servicio.precioServicio.toNumber().toFixed(2),
          servicio: {
            ...servicio.servicio,
            precio: servicio.servicio.precio.toNumber().toFixed(2),
          }
        })),
        medicamentos: tratamiento.medicamentos.map(med => ({
          ...med,
          costoUnitario: med.costoUnitario.toNumber().toFixed(2),
          medicamento: {
            ...med.medicamento,
            precio: med.medicamento.precio.toNumber().toFixed(2)
          }
        })),
        pago: tratamiento.pago ? {
          ...tratamiento.pago,
          total: tratamiento.pago.total.toNumber().toFixed(2),
        } : null
      }))
    };

    return historialFormateado;
  } catch (error) {
    return null;
  }
}


export async function obtenerTratamientoCompleto(tratamientoId: number): Promise<TratamientoCompleto | null> {
  try {
    const tratamiento = await prisma.tratamiento.findUnique({
      where: { id: tratamientoId, estado: {not:0} },
      include: {
        servicios: {
          include: {
            servicio: true
          }
        },
        medicamentos: {
          include: {
            medicamento: true
          }
        },
        pago: true
      }
    });

    if (!tratamiento) {
      return null;
    }
    
    // console.log("DETALLADO COMPLETO", JSON.stringify(tratamiento, null, 2), "DETALLADO COMPLETO");


    // Convertir los campos Decimal a string para que coincidan con las interfaces
    const tratamientoFormateado: TratamientoCompleto = {
      ...tratamiento,
      servicios: tratamiento.servicios.map(servicio => ({
        ...servicio,
        precioServicio: servicio.precioServicio.toNumber().toFixed(2),
        servicio: {
          ...servicio.servicio,
          precio: servicio.servicio.precio.toNumber().toFixed(2)
        }
      })),
      medicamentos: tratamiento.medicamentos.map(med => ({
        ...med,
        costoUnitario: med.costoUnitario.toNumber().toFixed(2),
        medicamento: {
          ...med.medicamento,
          precio: med.medicamento.precio.toNumber().toFixed(2)
        }
      })),
      pago: null
    };
    // console.log("DETALLADO COMPLETO", JSON.stringify(tratamientoFormateado, null, 2), "DETALLADO COMPLETO2");
    return tratamientoFormateado;
  } catch (error) {
    console.error("Error al obtener el tratamiento:", error);
    throw new Error("Ocurrió un error al obtener el tratamiento.");
  }
}


export async function generarPDFHistorial(historialId: number): Promise<string> {
  try {
    const isLocal = process.env.CHROME_EXECUTABLE_PATH ? true : false;

    const browserConfig = {
      args: isLocal ? [] : [
        ...chromium.args,
        '--no-sandbox',

            '--hide-scrollbars',
            '--disable-web-security',
            '--disable-setuid-sandbox',
            '--mute-audio',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--allow-running-insecure-content',
            '--disable-gpu',
            '--font-render-hinting=none',

            '--disable-dev-shm-usage',
      ],
      executablePath: isLocal
        ? process.env.CHROME_EXECUTABLE_PATH
        : await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v126.0.0/chromium-v126.0.0-pack.tar'),
      headless: true,
      ignoreHTTPSErrors: true,
    };

    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();


    // Navegar a la página del historial
    await page.goto(`${process.env.NEXT_PUBLIC_APP_URL}/historial-pdf?historialId=${historialId}`, {
      waitUntil: ["networkidle0", "domcontentloaded"],
      timeout: 30000,
    });

    // Esperar a que el contenido se cargue completamente
    await page.waitForSelector('#historial-pdf');

    // Generar PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    // Subir el PDF a Vercel Blob
    const { url } = await put(
      `historiales/historial-${historialId}-${Date.now()}.pdf`,
      pdf,
      {
        access: 'public',
        contentType: 'application/pdf',
      }
    );

    return url;
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    throw new Error("Error al generar el PDF del historial");
  }
}

import { HistorialMedicoCompletoCaptura } from "@/types";

export async function obtenerHistorialCompleto(historialId: number): Promise<HistorialMedicoCompletoCaptura | null> {
  try {
    const historial = await prisma.historialMedico.findUnique({
      where: { historialMascotaId: historialId },
      include: {
        mascota: {
          include: {
            usuario: true,
          },
        },
        tratamientos: {
          include: {
            servicios: {
              include: {
                servicio: true,
              },
            },
            medicamentos: {
              include: {
                medicamento: true,
              },
            },
            pago: true,
          },
        },
      },
    });

    if (!historial) return null;

    // Convertir Decimal a string usando toNumber().toFixed(2)
    const formattedHistorial: HistorialMedicoCompletoCaptura = {
      ...historial,
      tratamientos: historial.tratamientos.map(tratamiento => ({
        ...tratamiento,
        servicios: tratamiento.servicios.map(st => ({
          ...st,
          precioServicio: st.precioServicio.toNumber().toFixed(2),
          servicio: {
            ...st.servicio,
            precio: st.servicio.precio.toNumber().toFixed(2),
          },
        })),
        medicamentos: tratamiento.medicamentos.map(tm => ({
          ...tm,
          costoUnitario: tm.costoUnitario.toNumber().toFixed(2),
          medicamento: {
            ...tm.medicamento,
            precio: tm.medicamento.precio.toNumber().toFixed(2),
          },
        })),
        pago: tratamiento.pago
          ? {
              ...tratamiento.pago,
              total: tratamiento.pago.total.toNumber().toFixed(2),
            }
          : null,
      })),
    };

    return formattedHistorial;
  } catch (error) {
    console.error("Error al obtener el historial completo:", error);
    return null;
  }
}