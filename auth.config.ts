import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";

import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

export default {
    // Para mas detalles  minuto 3:31
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Github({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
        Facebook({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const camposValidos = LoginSchema.safeParse(credentials);

                if (camposValidos.success) {
                    const { email, password } = camposValidos.data;

                    const usuario = await getUserByEmail(email);
                    if (!usuario || !usuario.password) return null;

                    const matchPassword = await bcrypt.compare(password, usuario.password);

                    if (matchPassword) {
                        return {
                            ...usuario,
                            id: usuario.id.toString(),
                        };
                    }
                }

                return null;
            }
        })
    ],
} satisfies NextAuthConfig;