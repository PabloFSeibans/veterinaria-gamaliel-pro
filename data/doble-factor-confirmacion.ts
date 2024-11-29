import prisma from "@/lib/prisma"

export const getTwoFactorConfirmationByUserId = async (userId: number) => {
	try {
		const dobleFactorConfirmacion = await prisma.confirmacionDobleFactor.findUnique({
			where: {
				usuarioId: userId,
			},
		});
		return dobleFactorConfirmacion;
	} catch (error) {
		console.log(error);
		return null;
	}
};
