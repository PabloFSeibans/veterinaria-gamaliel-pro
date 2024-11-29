import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EstadoChat, Mensaje } from '@/types/chat';

export const useChatStore = create<EstadoChat>()(
  persist(
    (set) => ({
      mensajes: [],
      agregarMensaje: (mensaje) => set((state) => ({ mensajes: [...state.mensajes, mensaje] })),
      limpiarMensajes: () => set({ mensajes: [] }),
    }),
    {
      name: 'chat-storage',
    }
  )
);
