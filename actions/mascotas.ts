"use server";

import { put, del } from '@vercel/blob';
import * as z from "zod";
import { MascotaSchema } from "@/schemas";
import prisma from "@/lib/prisma"
import { Mascota, Sexo, TipoMascota } from "@prisma/client";
import { usuarioIdActual } from "@/lib/auth";
import { addHours, differenceInYears, differenceInMonths } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import { formatearNombre } from "@/lib/formatearNombre";
import { formatearDetalle } from "@/lib/formatearDescripcion";
import { revalidatePath } from "next/cache";
import { MascotaDivz } from "@/types";

export const obtenerMascotas = async (): Promise<Mascota[]> => {
    const mascotas = await prisma.mascota.findMany({
        where: {
            estado: {
                not: 0
            },
        },
        orderBy: {
            creadoEn: 'desc',
        }
    });
    const mascotasConFechaAjustada = mascotas.map(mascota => ({
        ...mascota,
        fechaNacimiento: mascota.fechaNacimiento ? addHours(new Date(mascota.fechaNacimiento), 4) : null,
    }));

    return mascotasConFechaAjustada;
}

export const obtenerMisMascotas = async (): Promise<Mascota[]> => {

    const usuarioId = await usuarioIdActual();
    const mascotas = await prisma.mascota.findMany({
        where: {
            idPropietario: usuarioId,
            estado: { not: 0 },
        },
        orderBy: {
            creadoEn: 'desc',
        }
    });
    const mascotasConFechaAjustada = mascotas.map(mascota => ({
        ...mascota,
        fechaNacimiento: mascota.fechaNacimiento ? addHours(new Date(mascota.fechaNacimiento), 4) : null,
    }));

    return mascotasConFechaAjustada;
}

export const obtenerMascotasAleatorias = async (): Promise<MascotaDivz[]> => {
    try {
        // Obtener todas las mascotas que cumplan con los criterios base
        const mascotasDisponibles = await prisma.mascota.findMany({
            where: {
                AND: [
                    { estado: { not: 0 } },
                    { imagen: { not: null } },
                    { NOT: { imagen: "" } },
                ],
            },
            select: {
                id: true,
                nombre: true,
                sexo: true,
                raza: true,
                especie: true,
                fechaNacimiento: true,
                imagen: true,
            },
        });

        // Si no hay mascotas disponibles, retornar array vacío
        if (!mascotasDisponibles.length) return [];

        // Función para obtener la edad formateada
        const obtenerEdadFormateada = (fechaNacimiento: Date | null): string => {
            if (!fechaNacimiento) return "Sin fecha de nacimiento";

            const años = differenceInYears(new Date(), fechaNacimiento);
            const meses = differenceInMonths(new Date(), fechaNacimiento) % 12;

            if (años > 0) {
                if (meses > 0) {
                    return `${años} año${años !== 1 ? 's' : ''} y ${meses} mes${meses !== 1 ? 'es' : ''}`;
                }
                return `${años} año${años !== 1 ? 's' : ''}`;
            }
            return `${meses} mes${meses !== 1 ? 'es' : ''}`;
        };

        // Mezclar el array de forma aleatoria (algoritmo Fisher-Yates)
        const mascotasAleatorias = mascotasDisponibles
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .slice(0, 25); // Tomar solo 25 mascotas

        // Mapear a la interfaz MascotaDivz
        return mascotasAleatorias.map(mascota => ({
            id: mascota.id,
            nombre: mascota.nombre,
            sexo: mascota.sexo,
            raza: mascota.raza,
            especie: mascota.especie,
            edad: obtenerEdadFormateada(mascota.fechaNacimiento),
            imagen: mascota.imagen!,
        }));

    } catch (error) {
        console.error("Error al obtener mascotas aleatorias:", error);
        return [];
    }
}

//TODO: Corregir bug de campos invalidos
export const registrarMascota = async (mascotaValues: z.infer<typeof MascotaSchema>) => {
    const validatedMascota = MascotaSchema.safeParse(mascotaValues);
    if (!validatedMascota.success) {
        return { error: "Campos Inválidos!" };
    }
    const { nombre, especie, raza, fechaNacimiento, sexo, detalles, idPropietario, peso, esterilizado, estado } = validatedMascota.data;

    const nombreF = formatearNombre(nombre);
    const detallesF = formatearDetalle(detalles);
    try {
        const idUActual = await usuarioIdActual();
        const mascota = await prisma.$transaction(async (tx) => {
            const mascotaCreada = await tx.mascota.create({
                data: {
                    nombre: nombreF,
                    especie,
                    raza,
                    fechaNacimiento,
                    sexo,
                    detalles: detallesF,
                    idPropietario,
                    peso: parseFloat(peso as string),
                    esterilizado,
                    estado: parseInt(estado as string, 10),
                    idUsuario: idUActual
                },
            });

            await tx.historialMedico.create({
                data: {
                    historialMascotaId: mascotaCreada.id,
                    estado: 1,
                    idUsuario: idUActual,
                },
            });

            return mascotaCreada;
        }, {
            timeout: 30000,
            maxWait: 35000,
            isolationLevel: 'Serializable'
          });
        revalidatePath('/admin/mascotas');
        revalidatePath('/admin/historiales');
        revalidatePath('/admin');
        revalidatePath('/cliente/mascotas');
        revalidatePath('/admin/tratamientos');
        revalidatePath('/mascotas');
        return { success: "Mascota y Historial Médico Registrados Correctamente!" };
    } catch (error) {
        console.error("Error al registrar mascota y historial médico:", error);
        return { error: "Ocurrió un error al registrar la mascota y su historial médico." };
    }
};

export const registrarMascotaConImagen = async (formMascota: FormData) => {
    try {
        const archivo = formMascota.get("archivo") as File | null;
        const nombre = formatearNombre(formMascota.get('nombre') as string) as string;
        const especie = formMascota.get('especie') as TipoMascota;
        const raza = formMascota.get('raza') as string;
        const fechaNacimiento = new Date(formMascota.get('fechaNacimiento') as string);
        const sexo = formMascota.get('sexo') as Sexo;
        const detalles = formatearDetalle(formMascota.get('detalles') as string) as string;
        const idPropietario = formMascota.get('idPropietario') ? parseInt(formMascota.get('idPropietario') as string, 10) : undefined;
        const peso = parseFloat(formMascota.get('peso') as string);
        const esterilizado = formMascota.get('esterilizado') === 'true';
        const estado = parseInt(formMascota.get('estado') as string, 10);

        let rutaImagen: string | null = null;
        if (archivo) {
            const extension = archivo.name.split('.').pop();
            const nombreUnico = `${uuidv4()}.${extension}`;
            const { url } = await put(`mascotas/${nombreUnico}`, archivo, {
                access: 'public',
            });
            rutaImagen = url;
        }

        const idUActual = await usuarioIdActual();
        const mascota = await prisma.$transaction(async (tx) => {
            const mascotaCreada = await tx.mascota.create({
                data: {
                    nombre,
                    especie,
                    raza,
                    fechaNacimiento,
                    sexo,
                    detalles,
                    idPropietario,
                    peso,
                    esterilizado,
                    estado,
                    imagen: rutaImagen,
                    idUsuario: idUActual
                },
            });

            await tx.historialMedico.create({
                data: {
                    historialMascotaId: mascotaCreada.id,
                    estado: 1,
                    idUsuario: idUActual,
                },
            });

            return mascotaCreada;
        }, {
            timeout: 30000,
            maxWait: 35000,
            isolationLevel: 'Serializable'
          });

        revalidatePath('/admin/mascotas');
        revalidatePath('/admin/historiales');
        revalidatePath('/admin');
        revalidatePath('/cliente/mascotas');
        revalidatePath('/admin/tratamientos');
        revalidatePath('/mascotas');
        return { success: "Mascota y Historial Médico Registrados Correctamente!" };
    } catch (error) {
        console.error("Error al registrar mascota y historial médico:", error);
        return { error: "Ocurrió un error al registrar la mascota y su historial médico." };
    }
};


export const editarMascota = async (values: z.infer<typeof MascotaSchema>, idMascota: number) => {
    const validatedFields = MascotaSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Campos inválidos!" };
    }

    const { nombre, especie, raza, sexo, fechaNacimiento, detalles, peso, estado } = validatedFields.data;
    try {
        const idUActual = await usuarioIdActual();
        const mascotaActualizada = await prisma.mascota.update({
            where: {
                id: idMascota,
            },
            data: {
                ...values,
                peso: parseFloat(peso as string),
                estado: parseInt(estado as string, 10) ? parseInt(estado as string, 10) : 1,
                idUsuario: idUActual,
            },
        });

        revalidatePath('/admin/mascotas');
        revalidatePath(`/admin/mascotas/${idMascota}`);
        revalidatePath('/admin/historiales');
        revalidatePath('/admin');
        revalidatePath('/cliente/mascotas');
        revalidatePath('/admin/tratamientos');
        revalidatePath('/mascotas');

        return { success: "Mascota Editada Correctamente!" };
    } catch (error) {
        console.error("Error al actualizar la mascota:", error);
        return { error: "Ocurrió un error al actualizar la mascota." };
    }
};

export const obtenerMascota = async (id: number) => {
    try {
        // Intentamos obtener la mascota
        const mascota = await prisma.mascota.findUnique({
            where: {
                id,
            },
        });

        // Si se encuentra la mascota, ajustamos la fecha de nacimiento
        if (mascota) {
            return {
                ...mascota,
                fechaNacimiento: mascota.fechaNacimiento
                    ? addHours(new Date(mascota.fechaNacimiento), 4) // Agregamos 4 horas a la fecha de nacimiento
                    : null,
            };
        }

        // Si no se encuentra la mascota, devolvemos null
        return null;
    } catch (error) {
        console.error("Error al obtener la mascota:", error);
        throw new Error("Ocurrió un error al obtener la mascota.");
    }
};



export const eliminarMascota = async (id: number) => {
    try {
        const mascota = await prisma.mascota.delete({
            where: { id },
        });

        if (!mascota) return { error: "Mascota no Encontrada" };
        revalidatePath('/admin/mascotas');
        revalidatePath('/admin/historiales');
        revalidatePath('/admin');
        revalidatePath('/cliente/mascotas');
        revalidatePath('/admin/tratamientos');
        revalidatePath('/mascotas');

        return { success: "La Mascota fue Removida Correctamente" };
    } catch (error) {
        console.error("Error al eliminar la mascota:", error);
        return { error: "Ocurrió un error al eliminar la mascota." };
    }
};


export const deshabilitarMascota = async (id: number) => {
    try {
        const usuarioActualId = await usuarioIdActual();

        if (!usuarioActualId || isNaN(usuarioActualId)) {
            throw new Error('ID del usuario autenticado no es válido');
        }

        const mascota = await prisma.mascota.update({
            where: { id },
            data: {
                estado: 0,
                idUsuario: usuarioActualId,
            },
        });

        if (!mascota) return { error: "Mascota no Encontrada" };
        revalidatePath('/admin/mascotas');
        revalidatePath('/admin/historiales');
        revalidatePath('/admin');
        revalidatePath('/cliente/mascotas');
        revalidatePath('/admin/tratamientos');
        revalidatePath('/mascotas');

        return { success: "La Mascota fue Deshabilitada Correctamente" };
    } catch (error) {
        console.error("Error al deshabilitar la mascota:", error);
        return { error: "Ocurrió un error al deshabilitar la mascota." };
    }
};