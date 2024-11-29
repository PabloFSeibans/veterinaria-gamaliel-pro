import { create } from 'zustand'
import { ResultadoBusqueda } from '@/actions/buscar'

interface SearchState {
  resultados: ResultadoBusqueda[]
  isSearching: boolean
  setResultados: (resultados: ResultadoBusqueda[]) => void
  setIsSearching: (isSearching: boolean) => void
  clearResultados: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  resultados: [],
  isSearching: false,
  setResultados: (resultados) => set({ resultados }),
  setIsSearching: (isSearching) => set({ isSearching }),
  clearResultados: () => set({ resultados: [] }),
}))