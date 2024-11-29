import NextAuth, { DefaultSession } from "next-auth"


export type UsuarioExtendido = DefaultSession["user"] & {
	rol: "Administrador" | "Usuario" | "Veterinario";
	authDobleFactor: boolean;
	isOAuth: boolean;
	celular: string | null;
	apellidoPat: string | null;
	apellidoMat: string | null;
	sexo: "M" | "F" | null;
	direccion: string | null;
	ci: string | null;
	estado: number;
	idUsuario: number | null;
	image: string | null;
	username: string | null;
	especialidades: string | null;
}

declare module "next-auth" {
	/**
	 * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: UsuarioExtendido
	}
}

import { JWT } from "next-auth/jwt"
 
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
	id?: number;
	name?: string | null;
	username?: string | null;
	apellidoPat?: string | null;
	apellidoMat?: string | null;
	ci?: string | null;
	sexo?: "M" | "F" | null;
	email?: string | null;
	emailVerified?: Date;
	image?: string | null;
    rol?: "Administrador" | "Usuario" | "Veterinario";
	celular?: string | null;
	direccion?: string | null;
	estado?: number;
	especialidades?: string | null;
	authDobleFactor?: boolean;
	idUsuario?: number | null;
  }
}
