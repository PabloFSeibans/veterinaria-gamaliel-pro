export interface Mensaje {
	id: string;
	contenido: string;
	rol: 'usuario' | 'asistente';
	timestamp: Date;
	audioUrl?: string | null;
  }
  
  export interface EstadoChat {
	mensajes: Mensaje[];
	agregarMensaje: (mensaje: Mensaje) => void;
	limpiarMensajes: () => void;
  }
  
  export interface VozElevenLabs {
	voice_id: string;
	name: string;
  }
  