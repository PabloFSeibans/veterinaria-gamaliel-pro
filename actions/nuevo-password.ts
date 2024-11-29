"use server";
import * as z from "zod";

import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
import { NuevoPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";

export const nuevoPassword = async (
	values: z.infer<typeof NuevoPasswordSchema>,
	token?: string | null,
) => {
	if(!token){
		return {error: "Pérdida de Token!"};
	}

	const camposValidos = NuevoPasswordSchema.safeParse(values);

	if(!camposValidos.success){
		return {error: "Campos Inválidos"};
	}

	const {password} = camposValidos.data;

	const tokenExistente = await getPasswordResetTokenByToken(token);

	if(!tokenExistente){
		return {error: "Token Inválido"};
	}

	const haExpirado = new Date(tokenExistente.expires)< new Date();

	if(haExpirado){
		return {error: "Token Expirado"};
	}

	const usuarioExistente = await getUserByEmail(tokenExistente.email);

	if(!usuarioExistente){
		return {error: "El correo no Existe!"};
	}

	const passwordHash = await bcrypt.hash(password, 10);
	await prisma.user.update({
		where: {id: usuarioExistente.id},
		data: {password: passwordHash},
	});

	await prisma.tokenReestablecimientoPassword.delete({
		where: {id: tokenExistente.id},
	});

	return {success: "Contraseña cambiada con éxito"};
}