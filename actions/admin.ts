"use server";

import { rolActual } from "@/lib/auth";
import { RolUsuario } from "@prisma/client";

export const admin = async () => {
    const rol = await rolActual();
    if (rol === RolUsuario.Administrador) {
		return {success: "Permitido en el servidor"};
	}
	return {error: "No permitido en el servidor"};
}