import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import authConfig from "@/auth.config"
import { getUserById } from "@/data/user"
import { getTwoFactorConfirmationByUserId } from "@/data/doble-factor-confirmacion";
import { getCuentaById } from "@/data/cuenta"
import {actualizarNombres} from "@/lib/formatearNombreAuth"

// CORRECION DE NUEVOS ATRIBUTOS EN EL TOKEN minuto 3:10
// RUTA COMPLETA DE VERIFICACION DE CREDENCIALES http://localhost:3000/api/auth/providers
export const {
  handlers,
  auth,
  signIn,
  signOut,
  //TODO: REVISAR SI ESTE UPDATE FUNCIONA EN LA ULTIMA VERSION O NO
  //para actualizar el usuario en el servidor
  // update,
  unstable_update,
} = NextAuth({
  //En este codigo se define la ruta por defecto cuando ocurre un error de autenticación
  //minuto 3:37
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
         where: {
            id: Number(user.id),
         },
         data: {
            emailVerified: new Date(),
         },
      })
    },
    async createUser({ user }) {
      try {
        const usuarioId = parseInt(user.id as string, 10);
        const {name, apellidoPat, apellidoMat} = actualizarNombres(user.name as string)
        await prisma.user.update({
          where: { id: usuarioId },
          data: { 
            name: name,
            apellidoPat: apellidoPat,
            apellidoMat: apellidoMat,
            idUsuario: usuarioId
          }
        });
      } catch (error) {
        console.error("Error al actualizar idUsuario:", error);
      }
    },
  },
  // Investigar acerca de los eventos de nextauth video 3:33
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Permitir OAuth sin verificación de correo electrónico
      // console.log({ user, account, profile, email, credentials }, "USUARIO EN SIGN IN");
      //Estas son las credenciales de google github y facebook
      if (account?.provider === 'credentials') {
        // console.log('Credenciales de inicio de sesión');
      };
      // console.log("USUARIO EN SIGN IN", {user, account, profile, email, credentials});

      //aca sigue la autenticacion por correo normal
      if (account?.provider !== 'credentials') return true;

      const usuarioExistente = await getUserById(Number(user.id));

      // Previene que inicie session un usuario sin verificacion de email
      // if (!usuarioExistente?.emailVerified) return false;

      //Previene que inicie session un usuario inhabilitado
      if (usuarioExistente?.estado === 0) return false;

      //ESTA ES LA AUTENTICACION DE DOBLE FACTOR
      if (usuarioExistente?.authDobleFactor) {
          const dobleFactorConfirmacion = await getTwoFactorConfirmationByUserId(usuarioExistente.id);
          if (!dobleFactorConfirmacion) return false;

          // Eliminar la confirmación de dos factores para el próximo inicio de sesión
          await prisma.confirmacionDobleFactor.delete({
              where: {
                  id: dobleFactorConfirmacion.id,
              }
          })
      }
      return true;
    },
    // Al parecer user y profile siempre estan como undefined asi que no los uses
    // en cambio para obtener el usuario usamos ek getuser si no devuelve el token original
    async jwt({ token, user, account, profile}) {
      // console.log({token, user, profile}, "USUARIO EN JWT");
      // //este es un campo agregado al token
      // token.campoCustom = 'Nuevo Campo';

      // console.log("ME ESTAN LLAMANDO DE NUEVO");
      // console.log("USUARIO  ",user);

      if(!token.sub) return token;

      const usuarioExistente = await getUserById(Number(token.sub));

      if(!usuarioExistente) return token; 

      // Controlando con que cuenta inicio session si con OAuth o no
      const cuentaExistente = await getCuentaById(usuarioExistente.id);

      // token.isOAuth = cuentaExistente ? true : false;
      token.isOAuth = !!cuentaExistente;  
      token.name = usuarioExistente.name;
      token.apellidoPat = usuarioExistente.apellidoPat;
      token.apellidoMat = usuarioExistente.apellidoMat;
      token.ci = usuarioExistente.ci;
      token.direccion = usuarioExistente.direccion;
      token.sexo = usuarioExistente.sexo as "M" | "F" | null; // Se asegura que el tipo sea compatible
      token.email = usuarioExistente.email;
      token.estado = usuarioExistente.estado;
      token.idUsuario = usuarioExistente.idUsuario;
      token.rol = usuarioExistente.rol;
      token.celular = usuarioExistente.celular;
      token.authDobleFactor = usuarioExistente.authDobleFactor;
      token.image = usuarioExistente.image;
      token.username = usuarioExistente.username;
      token.especialidades = usuarioExistente.especialidades;

      // console.log("TOKEN  ",token);
      return token;
    },
    // ESTOS SON LOS DATOS DEL USUARIO GUARDADOS EN EL TOKEN
    // el sub es el user id y podemos customizar campos
    //minuto 2:57
    async session({ session, token, user }) {
      // console.log({
      //   sessionToken: token,
      //   session
      // });

      // if (session.user) {
      //   session.user.campoCustom = token.campoCustom;
      // }

      if(token.sub && session.user) {
        session.user.id = token.sub;
      }

      if(token.rol && session.user) {
        // session.user.rol = token.rol as "ADMINISTRADOR" | "USUARIO";
        session.user.rol = token.rol;
        // el agregado de este rol esta definido en next-auth.bind.ts
        //si vuelve a fallar revisa el video 3:14
      }

      // Esto se agrego al minuto 6:25
      if(session.user) {
        session.user.authDobleFactor = token.authDobleFactor as boolean;
      }

      if(session.user) {
        session.user.name = token.name;
        session.user.apellidoPat = token.apellidoPat as string | null;
        session.user.apellidoMat = token.apellidoMat as string | null;
        session.user.sexo = token.sexo as "M" | "F" | null;
        session.user.ci = token.ci as string | null;
        session.user.direccion = token.direccion as string | null;
        session.user.estado = token.estado as number;
        session.user.idUsuario = token.idUsuario as number | null;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.celular = token.celular as string | null;
        session.user.image = token.image as string | null;
        session.user.username = token.username as string | null;
        session.user.especialidades = token.especialidades as string | null;
      }
      // console.log("SESION: ", session);
      // console.log({session, token, user}, "USUARIO EN SESSION FINAL");
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
})