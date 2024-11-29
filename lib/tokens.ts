import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma"
import { getVerificationTokenByEmail } from "@/data/verificacion-token";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/doble-factor-token";

export const generateTwoFactorToken = async (email: string) => {
	// TODO: investigar esto de crpto y esto del numero es un truco para verlo mejor, sigue siendo ese numero mismo
	const token = crypto.randomInt(100_000, 1_000_000).toString(); 
	// const expires = new Date(new Date().getTime() + 3600 * 1000); //el token tendra un tiempo de vida de 1 hora
	const expires = new Date(new Date().getTime() + 5 * 60 * 1000); //el token tendra un tiempo de vida de 5 minutos
	const existingToken = await getTwoFactorTokenByEmail(email);
	if (existingToken) {
		await prisma.tokenDobleFactor.delete({
			where: {
				id: existingToken.id,
			},
		});
	}
	const twoFactorToken = await prisma.tokenDobleFactor.create({
		data: {
			token,
			email,
			expires,
		},
	});
	return twoFactorToken;
};


export const generatePasswordResetToken = async (email: string) => {
	const token = uuidv4();
	const expires = new Date(new Date().getTime() + 3600 * 1000); //el token tendra un tiempo de vida de 1 hora

	const tokenExistente = await getPasswordResetTokenByEmail(email);
	
	if (tokenExistente) {
		await prisma.tokenReestablecimientoPassword.delete({
			where: {
				id: tokenExistente.id,
			},
		});
	}
	const passwordResetToken = await prisma.tokenReestablecimientoPassword.create({
		data: {
			token,
			email,
			expires,
		},
	});
	return passwordResetToken;
};


export const generateVerificationToken = async (email: string) => {
	const token = uuidv4();
	const expires = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30 * 2));

	const existingToken = await getVerificationTokenByEmail(email);
	
	if (existingToken) {
		await prisma.tokenVerificacion.delete({
			where: {
				id: existingToken.id,
			},
		});
	}
	const verificationToken = await prisma.tokenVerificacion.create({
		data: {
			token,
			email,
			expires,
		},
	});
	return verificationToken;
};
