import prisma from "@/lib/prisma"

export const getCuentaById = async (usuarioId: number) => {
    try {
		
		const cuenta = await prisma.account.findFirst({
			where: {
				userId: usuarioId
			}
		});
		return cuenta;
	} catch (error) {
		return null;
	}
}