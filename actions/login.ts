"use server";
import * as z from "zod";
import { AuthError } from "next-auth";
import { getUserByEmail } from '@/data/user';
import { enviarCorreodeVerificacion, enviarTokenDobleFactorEmail } from "@/lib/nodemailer";

import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import {
    generateVerificationToken,
    generateTwoFactorToken
} from "@/lib/tokens";

import { getTwoFactorTokenByEmail } from "@/data/doble-factor-token";
import prisma from "@/lib/prisma"
import { getTwoFactorConfirmationByUserId } from "@/data/doble-factor-confirmacion";

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
    const validatedFields = LoginSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Campos Inválidos!" };
    }

    const { email, password, codigo } = validatedFields.data;
    try {
        const existingUser = await getUserByEmail(email);

        if (!existingUser || !existingUser.email || !existingUser.password) {
            return { error: 'Credenciales Incorrectas Intente Nuevamente!' };
        }

        if (!existingUser.emailVerified) {
            const verificationToken = await generateVerificationToken(existingUser.email);

            await enviarCorreodeVerificacion(
                verificationToken.email,
                verificationToken.token
            );

            return { success: "Confirmación de Correo Enviada! Revisa Tu Correo para confirmar tu cuenta." };
        }

        if (existingUser.authDobleFactor && existingUser.email) {

            if (codigo) {
                const tokenDobleFactor = await getTwoFactorTokenByEmail(existingUser.email);

                if (!tokenDobleFactor) {
                    return { error: "El código ingresado es incorrecto" };
                }

                if (tokenDobleFactor.token !== codigo) {
                    return { error: "El código ingresado es incorrecto" };
                }

                const haExpirado = new Date(tokenDobleFactor.expires) <= new Date();

                if (haExpirado) {
                    return { error: "El código expiró" };
                }

                await prisma.tokenDobleFactor.delete({
                    where: {
                        id: tokenDobleFactor.id
                    }
                });

                const confirmacionExistente = await getTwoFactorConfirmationByUserId(existingUser.id);

                if (confirmacionExistente) {
                    await prisma.confirmacionDobleFactor.delete({
                        where: {
                            id: confirmacionExistente.id
                        }
                    });
                }


                await prisma.confirmacionDobleFactor.create({
                    data: {
                        usuarioId: existingUser.id,
                    }
                });

            } else {

                const tokenDobleFactor = await generateTwoFactorToken(existingUser.email);

                await enviarTokenDobleFactorEmail(
                    tokenDobleFactor.email,
                    tokenDobleFactor.token
                );

                return { dobleFactor: true };
            }
        }

        await signIn("credentials", {
            email,
            password,
            callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
        });
        // return { success: "Login Correcto" };
    } catch (error) {
        console.error("ERROR EN LOGIN ", error)
        if (error instanceof AuthError) {
            console.error("Tipo de Error:", error.type)
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email o contraseña incorrectos" };
                case "OAuthAccountNotLinked":
                    return { error: "No se ha conectado el perfil de GitHub" };
                // case "AccountNotFound":
                //     return { error: "El correo no existe" };
                // case "CredentialsExpired":
                //     return { error: "La cuenta ha expirado" };
                // case "CredentialsError":
                //     return { error: "Error de autenticación" };
                default:
                    return { error: "Error de autenticación" };
            }
        }

        throw error;
    }
};