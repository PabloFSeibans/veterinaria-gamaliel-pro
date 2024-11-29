import prisma from "@/lib/prisma"

export const getTwoFactorTokenByToken = async (token: string) => {
	try {
		const dobleFactorToken = await prisma.tokenDobleFactor.findUnique({
			where: {
				token: token,
			},
		});
		return dobleFactorToken;
	} catch (error) {
		console.log(error);
		return null;
	}
};

//TODO: INVESTIGAR LA DIFERENCIA DE FINDUNIQUE Y FINDFIRST
export const getTwoFactorTokenByEmail = async (email: string) => {
	try {
		const dobleFactorToken = await prisma.tokenDobleFactor.findFirst({
			where: {
				email: email,
			},
		});
		return dobleFactorToken;
	} catch (error) {
		console.log(error);
		return null;
	}
};
