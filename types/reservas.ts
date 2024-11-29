export interface ReservaMedicaT {
	id?: number;
	fechaReserva: Date;
	detalles: string | null;
	estado: number;
	usuarioId: number;
	creadoEn: Date;
	actualizadoEn?: Date | null;
	idUsuario: number;
	usuario?: {
	  id: number;
	  name: string;
	  email: string | null;
	};
  }
  
  export interface ReservaMedicaUsuarioT {
	id?: number;
	fechaReserva: Date;
	detalles: string | null;
	estado: number;
	usuarioId: number;
	creadoEn: Date;
	actualizadoEn?: Date | null;
	idUsuario: number;
  }
  
  export interface UsuarioT {
	id: number;
	nombreCompleto: string;
	email: string;
	image: string | null;
	ci: string | null;
	celular: string | null;
	rol: string;
  }
  
  // Nueva interfaz para el resumen de reservas
  export interface ResumenReservasT {
	citas: ReservaMedicaUsuarioT[];
	resumen: {
	  pendientes: number;
	  completadas: number;
	  canceladas: number;
	};
  }