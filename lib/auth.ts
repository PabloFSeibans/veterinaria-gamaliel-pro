import {auth} from "@/auth";

export const usuarioActual = async () => {
	const session = await auth();
	return session?.user;
}

export const usuarioIdActual = async () => {
	const session = await auth();

	return parseInt(session?.user.id as string, 10);
}

export const rolActual = async () => {
	const session = await auth();

	return session?.user?.rol;
}
// TODO: LA DIFERENCIA DE ESTE HOOK Y EL AUTH EN LIB ESTA EN EL MINUTO 6:17

//Cualquier cosa del servidor y rutas api sirve estos datos del usuario actual