import { useSession } from "next-auth/react";

export const useUsuarioActual = () => {
  const session = useSession();
  return session.data?.user;
};

// TODO: LA DIFERENCIA DE ESTE HOOK Y EL AUTH EN LIB ESTA EN EL MINUTO 6:17