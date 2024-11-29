// @/actions/chat
'use server'
import { put, del } from '@vercel/blob';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from "next/cache";


const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

type VozElevenLabs = {
	voice_id: string;
	name: string;
};

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
	systemInstruction: `
	Eres Sofía, una inteligencia artificial avanzada diseñada exclusivamente por Pablo Fernández para apoyar a los veterinarios de la Veterinaria Gamaliel. Tu propósito es asistir a los médicos veterinarios y técnicos en el manejo integral de la salud y el bienestar animal, proporcionando información actualizada y precisa en el campo de la medicina veterinaria.

	Nunca usas asteriscos (*) en tus respuestas.
	Propósito principal:
	
	Ofrecer asistencia técnica especializada a veterinarios, asegurando el más alto nivel de precisión en diagnósticos, tratamientos y manejo clínico de animales de compañía, incluyendo perros, gatos, aves, roedores y reptiles.
	
	Características clave:
	Conocimiento veterinario profundo: Posees un dominio avanzado en diagnósticos clínicos, farmacología, patología, manejo pre y postquirúrgico, emergencias veterinarias y protocolos de cuidado preventivo. Además, tienes acceso a las últimas investigaciones científicas en medicina veterinaria.
	
	Atención clínica especializada: Proporcionas detalles clave sobre síntomas, enfermedades comunes, procedimientos quirúrgicos, dosificación de medicamentos, interacciones farmacológicas y planes de tratamiento específicos para cada especie y raza, ajustados a su condición médica particular.
	
	Soporte en emergencias: Guias a los veterinarios en la toma de decisiones ante situaciones críticas, como traumatismos, intoxicaciones, shock, infecciones graves, fallo multiorgánico, y ofreces pautas de intervención basadas en protocolos actualizados de emergencia veterinaria.
	
	Asistencia en manejo del bienestar animal: Asesoras sobre el bienestar integral de los animales, recomendando estrategias de manejo ambiental, enriquecimiento conductual, protocolos de vacunación, planes de nutrición específicos y medidas preventivas contra enfermedades infecciosas.
	
	Actualización constante: Proporcionas información actualizada en nuevas terapias, tecnología veterinaria, medicina regenerativa y estudios clínicos recientes, ayudando al veterinario a mantenerse al día con las últimas tendencias y avances.
	
	Optimización del tiempo clínico: Ayudas en la gestión de citas, recordatorios para procedimientos clave (como vacunaciones o chequeos postoperatorios), además de ofrecer sugerencias sobre la administración y logística de los casos clínicos.
	
	Comunicación precisa: Evitas el uso de jerga innecesaria cuando no es pertinente, pero puedes comunicarte usando lenguaje técnico con facilidad. Siempre enfatizas la necesidad de pruebas complementarias o consulta presencial para casos complejos o que requieran diagnóstico definitivo.
	
	Directrices de interacción:
	Tu comunicación es clara, técnica y precisa, adaptada siempre a un entorno clínico.
	Rara Vez usas emojis en tus respuestas.
	Sólo hablas en español, manteniendo un lenguaje formal y técnico.
	Tus respuestas están enfocadas en apoyar a los veterinarios en sus decisiones clínicas, sin interactuar directamente con los dueños de mascotas.
	Finalizas las interacciones con una nota profesional relacionada con la importancia del seguimiento continuo de los casos clínicos.
	Ejemplo de cierre: "Recuerde que el monitoreo post-tratamiento es esencial para asegurar la recuperación completa del paciente. Estoy disponible para cualquier consulta adicional sobre protocolos clínicos o manejo de casos."
	`,
	generationConfig: {
		temperature: 1,
		topP: 0.95,
		topK: 64,
		maxOutputTokens: 30,
		responseMimeType: "text/plain",
		stopSequences: ["Fin del Mensaje."],
		// maxOutputTokens: 8192,
	},
});

const chat = model.startChat({
	history: [],
	generationConfig: {
		temperature: 1,
		topP: 0.95,
		topK: 64,
		maxOutputTokens: 30,
		responseMimeType: "text/plain",
		stopSequences: ["Fin del Mensaje."],
		// maxOutputTokens: 8192,
	},
});

/**
 * Función para eliminar todos los asteriscos de un string.
 * @param input El string de entrada que contiene asteriscos.
 * @returns El string sin asteriscos.
 */
function eliminarAsteriscos(input: string): string {
	return input.replace(/\*/g, '');
}

export async function enviarMensaje(mensaje: string, vozSeleccionada: string): Promise<{ texto: string; audioUrl: string | null }> {
	try {
		const result = await chat.sendMessage(mensaje);
		const response = result.response;
		const texto = eliminarAsteriscos(response.text());
		const audioUrl = await generarAudio(texto, vozSeleccionada);
        revalidatePath('/admin/ia');
		return { texto, audioUrl };
	} catch (error) {
		console.error("Error al enviar mensaje a Gemini:", error);
		return { texto: "Lo siento, ha ocurrido un error al procesar tu mensaje.", audioUrl: "" };
	}
}
/*
async function enviarMensajeConReintento(mensaje: string, vozSeleccionada: string, maxIntentos = 3): Promise<{ texto: string; audioUrl: string | null }> {
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      return await enviarMensaje(mensaje, vozSeleccionada);
    } catch (error) {
      if (intento === maxIntentos) throw error;
      console.log(`Intento ${intento} fallido. Reintentando en ${intento * 2} segundos...`);
      await new Promise(resolve => setTimeout(resolve, intento * 2000));
    }
  }
  throw new Error("Máximo de intentos alcanzado");
}
 */

async function generarAudio(texto: string, voz: string): Promise<string> {
	try {
		const response = await fetch(
			`https://api.elevenlabs.io/v1/text-to-speech/${voz}`,
			{
				method: "POST",
				headers: {
					accept: "audio/mpeg",
					"Content-Type": "application/json",
					"xi-api-key": process.env.ELEVENLABS_API_KEY!,
				},
				body: JSON.stringify({
					text: texto,
					voice_settings: {
						stability: 0,
						similarity_boost: 0,
					},
				}),
			}
		);

		if (!response.ok) {
			throw new Error("Error al generar audio");
		}

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const fileName = `${uuidv4()}.mp3`;

		// Subir el archivo de audio a Vercel Blob
		const { url } = await put(`audio/${fileName}`, buffer, {
			access: 'public',
			contentType: 'audio/mpeg',
		});

		return url;

	} catch (error) {
		console.error("Error al generar audio:", error);
		throw error;
	}
}


export async function obtenerVoces(): Promise<VozElevenLabs[]> {
	try {
		const response = await fetch("https://api.elevenlabs.io/v1/voices", {
			headers: {
				accept: "application/json",
				"xi-api-key": process.env.ELEVENLABS_API_KEY!,
			},
		});

		if (!response.ok) {
			throw new Error(`Error al obtener voces: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data.voices;
	} catch (error) {
		console.error("Error al obtener voces:", error);
		throw error; // Re-lanzamos el error para manejarlo en el componente
	}
}