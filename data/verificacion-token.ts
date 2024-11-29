import prisma from "@/lib/prisma"

export const getVerificationTokenByToken = async (
	token: string
) => {
	try {
		const verificacionToken = await prisma.tokenVerificacion.findUnique({
			where: {
				token: token,
			},
		});
		return verificacionToken;
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const getVerificationTokenByEmail = async (
	email: string
) => {
	try {
		const verificacionToken = await prisma.tokenVerificacion.findFirst({
			where: {
				email: email,
			},
		});
		return verificacionToken;
	} catch (error) {
		console.log(error);
		return null;
	}
};