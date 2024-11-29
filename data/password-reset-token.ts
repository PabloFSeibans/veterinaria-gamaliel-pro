import prisma from "@/lib/prisma"

export const getPasswordResetTokenByToken = async (token: string) => {
	try{
		const tokenPasswordReset = await prisma.tokenReestablecimientoPassword.findUnique({
			where: {token}
		});

		return tokenPasswordReset;
	}catch{
		return null;
	}
}

export const getPasswordResetTokenByEmail = async (email: string) => {
	try{
		const tokenPasswordReset = await prisma.tokenReestablecimientoPassword.findFirst({
			where: {email}
		});

		return tokenPasswordReset;
	}catch{
		return null;
	}
}