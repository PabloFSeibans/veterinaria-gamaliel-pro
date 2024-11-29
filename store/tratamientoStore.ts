// @/store/tratamientoStore.ts
import { create } from 'zustand'
import { TratamientoFormT, STFormT, TMFormT } from '@/types'

interface TratamientoStore {
  tratamiento: TratamientoFormT;
  setTratamiento: (tratamiento: TratamientoFormT) => void;
  // actualizarCampo: (campo: keyof TratamientoFormT, valor: any) => void;
  actualizarCampo: <K extends keyof TratamientoFormT>(
    campo: K,
    valor: TratamientoFormT[K]
  ) => void;
  agregarServicio: (servicio: STFormT) => void;
  eliminarServicio: (servicioId: number) => void;
  agregarMedicamento: (medicamento: TMFormT) => void;
  actualizarMedicamento: (index: number, medicamento: Partial<TMFormT>) => void;
  eliminarMedicamento: (index: number) => void;
  calcularTotalTratamiento: () => number;
  calcularTotalServicios: () => number;
  calcularTotalMedicamentos: () => number;
  resetTratamiento: (historialId: number) => void;
  servicioYaAgregado: (servicioId: number) => boolean;
}

const tratamientoInicial: TratamientoFormT = {
  descripcion: '',
  estado: 1,
  diagnostico: null,
  historialMascotaId: 0,
  servicios: [],
  medicamentos: [],
  total: 0,
  detalle: null,
  esAyudaVoluntaria: false,
};

export const useTratamientoStore = create<TratamientoStore>((set, get) => ({
  tratamiento: tratamientoInicial,
  setTratamiento: (tratamiento) => set({ tratamiento }),
  actualizarCampo: (campo, valor) => set((state) => ({
    tratamiento: { ...state.tratamiento, [campo]: valor }
  })),
  agregarServicio: (servicio) => set((state) => {
    const nuevosTratamientos = {
      ...state.tratamiento,
      servicios: [...state.tratamiento.servicios, servicio]
    };
    const nuevoTotal = get().calcularTotalTratamiento();
    return { tratamiento: { ...nuevosTratamientos, total: nuevoTotal } };
  }),
  eliminarServicio: (servicioId) => set((state) => {
    const nuevosTratamientos = {
      ...state.tratamiento,
      servicios: state.tratamiento.servicios.filter((s) => s.servicioId !== servicioId)
    };
    const nuevoTotal = get().calcularTotalTratamiento();
    return { tratamiento: { ...nuevosTratamientos, total: nuevoTotal } };
  }),
  agregarMedicamento: (medicamento) => set((state) => {
    const nuevosTratamientos = {
      ...state.tratamiento,
      medicamentos: [...state.tratamiento.medicamentos, medicamento]
    };
    const nuevoTotal = get().calcularTotalTratamiento();
    return { tratamiento: { ...nuevosTratamientos, total: nuevoTotal } };
  }),
  actualizarMedicamento: (index, medicamento) => set((state) => {
    const nuevosTratamientos = {
      ...state.tratamiento,
      medicamentos: state.tratamiento.medicamentos.map((m, i) =>
        i === index ? { ...m, ...medicamento } : m
      )
    };
    const nuevoTotal = get().calcularTotalTratamiento();
    return { tratamiento: { ...nuevosTratamientos, total: nuevoTotal } };
  }),
  eliminarMedicamento: (index) => set((state) => {
    const nuevosTratamientos = {
      ...state.tratamiento,
      medicamentos: state.tratamiento.medicamentos.filter((_, i) => i !== index)
    };
    const nuevoTotal = get().calcularTotalTratamiento();
    return { tratamiento: { ...nuevosTratamientos, total: nuevoTotal } };
  }),
  calcularTotalTratamiento: () => {
    const state = get();
    return state.calcularTotalServicios() + state.calcularTotalMedicamentos();
  },
  calcularTotalServicios: () => {
    const state = get();
    return state.tratamiento.servicios.reduce((total, servicio) => 
      total + parseFloat(servicio.precioServicio), 0);
  },
  calcularTotalMedicamentos: () => {
    const state = get();
    return state.tratamiento.medicamentos.reduce((total, med) => 
      total + (med.cantidad * parseFloat(med.costoUnitario)), 0);
  },
  resetTratamiento: (historialId) => set((state) => ({
    tratamiento: { ...tratamientoInicial, historialMascotaId: historialId }
  })),
  servicioYaAgregado: (servicioId) => {
    const state = get();
    return state.tratamiento.servicios.some(s => s.servicioId === servicioId);
  },
}));