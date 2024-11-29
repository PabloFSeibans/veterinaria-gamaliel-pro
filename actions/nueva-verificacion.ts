"use server"

import prisma from "@/lib/prisma"
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verificacion-token";

export const nuevaVerificacion = async (token: string) =>{
	const tokenExistente = await getVerificationTokenByToken(token);

	if (!tokenExistente){
		return {
			status: 400,
			error: "El token no existe"
		}
	}

	// const haExpirado= new Date(tokenExistente.expires).getTime() < new Date().getTime();
	const haExpirado= new Date(tokenExistente.expires) < new Date();
	if (haExpirado){
		return {
			status: 400,
			error: "El token ha expirado"
		}
	}

	const usuarioExistente = await getUserByEmail(tokenExistente.email);
	if (!usuarioExistente){
		return {
			status: 400,
			error: "El usuario no existe"
		}
	}

	await prisma.user.update({
		where: {
			id: usuarioExistente.id
		},
		data: {
			emailVerified: new Date(),
			email: tokenExistente.email
		}
	});

	await prisma.tokenVerificacion.delete({
		where: {
			id: tokenExistente.id
		}
	});

	return {
		status: 200,
		success: "Verificacion exitosa"
	}
}