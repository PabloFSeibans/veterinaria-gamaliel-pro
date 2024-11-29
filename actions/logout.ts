"use server";

import { signOut } from "@/auth";

export const logout = async () => {
	//TODO: Aca puedes poner cualquier cosa que quieras hacer en el servidor antes de salir de la session
	await signOut();
}