import { useSession } from "next-auth/react";

export const useRolActual = () => {
  const session = useSession();
  return session.data?.user?.rol;
};


//Todo este hook me sirve en el lado del cliente