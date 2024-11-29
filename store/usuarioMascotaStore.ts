import { create } from 'zustand';
import { RolUsuario, Sexo, TipoMascota } from "@prisma/client";

interface Usuario {
  name: string;
  apellidoPat: string;
  apellidoMat?: string ;
  ci?: string;
  sexo?: "M" | "F";
  email: string;
  celular?: string;
  direccion?: string;
  rol: RolUsuario;
  imagen?: string;
  archivo?: File;
}

interface Mascota {
  nombre: string;
  especie: TipoMascota;
  raza: string;
  fechaNacimiento?: Date;
  sexo: Sexo;
  detalles?: string;
  peso: string;
  esterilizado?: boolean;
  imagen?: string;
  archivo?: File;
}

interface UsuarioMascotasStore {
  usuario: Usuario;
  mascotas: Mascota[];
  setUsuario: (usuario: Usuario) => void;
  addMascota: (mascota: Mascota) => void;
  updateMascota: (index: number, mascota: Mascota) => void;
  removeMascota: (index: number) => void;
  setMascotas: (mascotas: Mascota[]) => void;
  reset: () => void;
}

export const useUsuarioMascotasStore = create<UsuarioMascotasStore>((set) => ({
  usuario: {
    name: "",
    apellidoPat: "",
    email: "",
    rol: RolUsuario.Usuario,
  },
  mascotas: [],
  setUsuario: (usuario) => set({ usuario }),
  addMascota: (mascota) => set((state) => ({ mascotas: [...state.mascotas, mascota] })),
  updateMascota: (index, mascota) => set((state) => ({
    mascotas: state.mascotas.map((m, i) => i === index ? mascota : m)
  })),
  removeMascota: (index) => set((state) => ({
    mascotas: state.mascotas.filter((_, i) => i !== index)
  })),
  setMascotas: (mascotas) => set({ mascotas }),
  reset: () => set({ 
    usuario: { name: "", apellidoPat: "", email: "", rol: RolUsuario.Usuario }, 
    mascotas: [] 
  }),
}));