import {Resend} from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
const dominio = process.env.NEXT_PUBLIC_APP_URL;

export const enviarTokenDobleFactorEmail = async (
	email: string,
	token: string
) => {
	await resend.emails.send({
		from: "onboarding@resend.dev",
		to: email,
		subject: "Código de Protección de Doble Factor",
		html:`<p>Tu Código de Ingreso es: ${token}</p>`,
		// text: `
      	// 	Hola,
      
      	// 	Para verificar tu cuenta, por favor visita el siguiente enlace:
      	// 	${process.env.VERIFICATION_URL}/${token}
    
      	// 	Graciass,
      	// 	Correode 
    	// 	`,
  });
};

export const enviarCorreodeReestablecimientodePassword = async (
	email: string,
	token: string
) => {
	const linkConfirmacion = `${dominio}/auth/nuevo-password?token=${token}`;

	await resend.emails.send({
    	from: "onboarding@resend.dev",
    	to: email,
    	subject: "Reestablece tu Contraseña",
		html:`<p>Click <a href="${linkConfirmacion}">aquí</a> para reestablecer tu contraseña.</p>`,
    	// text: `
      	// 	Hola,
      
      	// 	Para verificar tu cuenta, por favor visita el siguiente enlace:
      	// 	${process.env.VERIFICATION_URL}/${token}
    
      	// 	Graciass,
      	// 	Correode
    	// 	`,
  });
}; 

export const enviarCorreodeVerificacion = async (
	email: string,
	token: string
) => {
	const linkConfirmacion = `${dominio}/auth/nueva-verificacion?token=${token}`;

	await resend.emails.send({
    	from: "onboarding@resend.dev",
    	to: email,
    	subject: "Confirma tu Dirección de Correo Electrónico",
		html:`<p>Click <a href="${linkConfirmacion}">aquí</a> para confirmar tu dirección de correo electrónico.</p>`,
    	// text: `
      	// 	Hola,
      
      	// 	Para verificar tu cuenta, por favor visita el siguiente enlace:
      	// 	${process.env.VERIFICATION_URL}/${token}
    
      	// 	Graciass,
      	// 	Correode
    	// 	`,
  });
}; 
