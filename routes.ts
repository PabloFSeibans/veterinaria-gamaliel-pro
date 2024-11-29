/**
 * Un array de rutas públicas que son accesibles al publico
 * Estas rutas no requieren autenticación
 * @type {string[]}	
 */
export const publicRoutes = [
	"/",
	"/divz",
	"/auth/nueva-verificacion",
	"/bento",
	"/api/uploadthing",
	"/reportes",
	"/reportes/usuarios",
	"/reportes/mascotas",
	"/reportes/reservas",
	"/reportes/historiales",
	"/reportes/tratamientos",
	"/reportes/medicamentos",
	"/reportes/servicios",
	"/reportes/pagos",
	"/historial-pdf",
	"/tratamiento-pdf",
	"/mascotas"
];

/**
 * Un array de rutas públicas que son usadas para la autenticación
 * Estas rutas redigiran al logueo a los usuarios que van a /settings
 * @type {string[]}	
 */
export const authRoutes = [
	"/auth/login",
	"/auth/registro",
	"/auth/error",
	"/auth/reset",
	"/auth/nuevo-password",
];

/**
 * Este prefijo para la autenticacion de rutas API
 * Las rutas que comienzan con este prefijo se utilizan para la autenticación de la API.
 * @type {string}	
 */
export const apiAuthPrefix = "/api/auth";

/**
 * La ruta de redirección por defecto después de iniciar sesión
 * @type {string}	
 */
export const DEFAULT_LOGIN_REDIRECT = "/admin";