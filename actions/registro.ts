"use server";
import { put } from '@vercel/blob';
import * as z from "zod";
import { RegistroSchema, RegistroAdminSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma"
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { enviarCorreodeVerificacion } from "@/lib/nodemailer";
import { formatearNombre } from "@/lib/formatearNombre";
import { generarPassword } from '@/lib/generarPassword';
import { usuarioIdActual } from "@/lib/auth";
import { RolUsuario } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from "next/cache";

export const registro = async (values: z.infer<typeof RegistroSchema>) => {
    const camposValidos = RegistroSchema.safeParse(values);

    if (!camposValidos.success) {
        return { error: "Campos Inválidos!" };
    }
    const {
        name,
        apellidoPat,
        apellidoMat,
        ci,
        sexo,
        celular,
        email,
        password,
        direccion,
    } = camposValidos.data;

    const formattedName = formatearNombre(name);
    const formattedApellidoPat = apellidoPat ? formatearNombre(apellidoPat) : null;
    const formattedApellidoMat = apellidoMat ? formatearNombre(apellidoMat) : null;
    const formattedDireccion = direccion ? direccion.trim() : null;

    const usuarioExistente = await getUserByEmail(email);
    if (usuarioExistente) {
        return { error: "El correo ya se encuentra Registrado!" };
    }

    const passwordEncriptado = await bcrypt.hash(password, 10);

    try {
        const usuario = await prisma.$transaction(async (tx) => {
            const usuarioCreado = await tx.user.create({
                data: {
                    name: formattedName,
                    apellidoPat: formattedApellidoPat,
                    apellidoMat: formattedApellidoMat,
                    ci: ci ? ci.replaceAll(" ", "") : null,
                    sexo: sexo ? sexo.replaceAll(" ", "") : null,
                    celular: celular ? celular.replaceAll(" ", "") : null,
                    direccion: formattedDireccion,
                    email,
                    password: passwordEncriptado
                },
            });

            const usuarioActualizado = await tx.user.update({
                where: { id: usuarioCreado.id },
                data: {
                    idUsuario: usuarioCreado.id
                }
            });

            return usuarioActualizado;
        }, {
            timeout: 30000,
            maxWait: 35000,
            isolationLevel: 'Serializable'
          });
        const tokenVerificacion = await generateVerificationToken(email);

        await enviarCorreodeVerificacion(
            tokenVerificacion.email,
            tokenVerificacion.token
        )

        return { success: "Te enviamos un correo de confirmación a tu correo electrónico, para confirmar tu cuenta." };
    } catch (error) {
        console.error("Error en el Registro: ", error);
        return { error: "Error al registrar usuario!" };
    }

};

export const registrarUsuarioByAdmin = async (values: z.infer<typeof RegistroAdminSchema>) => {
    const validatedFields = RegistroAdminSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Campos Inválidos!" };
    }

    const { name, apellidoPat, apellidoMat, ci, sexo, email, celular, direccion, rol, especialidades } = validatedFields.data;

    try {
        const formattedName = formatearNombre(name);
        const formattedApellidoPat = apellidoPat ? formatearNombre(apellidoPat) : null;
        const formattedApellidoMat = apellidoMat ? formatearNombre(apellidoMat) : null;
        const formattedDireccion = direccion ? direccion.trim() : null;

        let usuarioExistente;
        if (email !== undefined) {
            usuarioExistente = await getUserByEmail(email);
        } else {
            return { error: "El correo es requerido" }
        }

        if (usuarioExistente) {
            return { error: "El correo ya se encuentra Registrado!" };
        }

        const password = generarPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const idUActual = await usuarioIdActual();

        const user = await prisma.user.create({
            data: {
                name: formattedName,
                apellidoPat: formattedApellidoPat,
                apellidoMat: formattedApellidoMat,
                ci: ci ? ci.replaceAll(" ", "") : null,
                sexo: sexo ? sexo.replaceAll(" ", "") : null,
                celular: celular ? celular.replaceAll(" ", "") : null,
                direccion: formattedDireccion,
                email,
                password: hashedPassword,
                rol,
                especialidades: rol === RolUsuario.Veterinario ? especialidades : null,
                idUsuario: idUActual,
            },
        });

        const tokenVerificacion = await generateVerificationToken(email);

        await enviarCorreodeVerificacion(tokenVerificacion.email, tokenVerificacion.token, password);

        revalidatePath('/admin/usuarios');
        revalidatePath("/admin/pagos")
        revalidatePath("/admin/tratamientos")
        revalidatePath("/admin/mascotas")
        revalidatePath("/admin/historiales")
        revalidatePath("/admin")

        return { success: "Usuario Registrado Correctamente!" };
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return { error: "Ocurrió un error al registrar el usuario." };
    }
};

export const registrarUsuarioConImagen = async (formData: FormData) => {
    try {
        const archivo = formData.get("archivo") as File | null;
        const name = formData.get('name') as string;
        const apellidoPat = formData.get('apellidoPat') as string;
        const apellidoMat = formData.get('apellidoMat') as string | undefined;
        const ci = formData.get('ci') as string | undefined;
        const sexo = formData.get('sexo') as string | undefined;
        const email = formData.get('email') as string;
        const celular = formData.get('celular') as string | undefined;
        const direccion = formData.get('direccion') as string | undefined;
        const rol = formData.get('rol') as RolUsuario;
        const especialidades = formData.get('especialidades') as string | null;

        const formattedName = formatearNombre(name);
        const formattedApellidoPat = apellidoPat ? formatearNombre(apellidoPat) : null;
        const formattedApellidoMat = apellidoMat ? formatearNombre(apellidoMat) : null;
        const formattedDireccion = direccion ? direccion.trim() : null;

        const usuarioExistente = await getUserByEmail(email);
        if (usuarioExistente) {
            return { error: "El correo ya se encuentra Registrado!" };
        }

        let rutaImagen: string | null = null;

        if (archivo) {
            const extension = archivo.name.split('.').pop();
            const nombreUnico = `${uuidv4()}.${extension}`;
            const { url } = await put(`usuarios/${nombreUnico}`, archivo, {
                access: 'public',
            });
            rutaImagen = url;
        }

        const password = generarPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const idUActual = await usuarioIdActual();

        const user = await prisma.user.create({
            data: {
                name: formattedName,
                apellidoPat: formattedApellidoPat,
                apellidoMat: formattedApellidoMat,
                ci: ci ? ci.replaceAll(" ", "") : null,
                sexo: sexo ? sexo.replaceAll(" ", "") : null,
                celular: celular ? celular.replaceAll(" ", "") : null,
                direccion: formattedDireccion,
                email,
                password: hashedPassword,
                rol,
                especialidades: rol === RolUsuario.Veterinario ? especialidades : null,
                image: rutaImagen,
                idUsuario: idUActual,
            },
        });

        const tokenVerificacion = await generateVerificationToken(email);

        await enviarCorreodeVerificacion(tokenVerificacion.email, tokenVerificacion.token, password);

        revalidatePath('/admin/usuarios');
        revalidatePath("/admin/pagos")
        revalidatePath("/admin/tratamientos")
        revalidatePath("/admin/mascotas")
        revalidatePath("/admin/historiales")
        revalidatePath("/admin")
        return { success: "Usuario Registrado Correctamente!" };
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return { error: "Ocurrió un error al registrar el usuario." };
    }
};