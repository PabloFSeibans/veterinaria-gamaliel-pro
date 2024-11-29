// import nodemailer from "nodemailer";
// import Mail from "nodemailer/lib/mailer";
// import SMTPTransport from "nodemailer/lib/smtp-transport";
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
// //   secure: process.env.NODE_ENV !== "development", // true,
//   secure: true,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// } as SMTPTransport.Options);

// type EnviarEmailDto = {
//   sender: Mail.Address,
//   receipients: Mail.Address[],
//   subject: string,
//   // text: string,
//   // html: string,
//   message: string | undefined,
// }

// export const sendMail = async (dto: EnviarEmailDto) => {
//   const { sender, receipients, subject, message } = dto;
//   return transporter.sendMail({
//     from: sender,
//     to: receipients,
//     subject,
//     html: message,
//     text: message,
//   });
// };

// // const plantillaEmail = (linkConfirmacion: string, email?: string, password?: string) => `
// // <!DOCTYPE html>
// // <html lang="es">
// // <head>
// //     <meta charset="UTF-8">
// //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
// //     <title>Veterinaria Gamaliel</title>
// // </head>
// // <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: radial-gradient(circle, rgba(253,174,135,0.7) 35%, rgba(254,99,43,0.7) 100%), url('https://res.cloudinary.com/dy8crd62e/image/upload/v1726963191/fondo_uziwcb.png'); background-size: cover; background-repeat: no-repeat; background-position: center; color: #333;">

// //     <div style="position: relative; z-index: 1;">
// //         <div style="padding: 20px; text-align: center;">
// //             <h1 style="margin: 0; color: white;">Veterinaria Gamaliel</h1>
// //         </div>

// //         <div style="max-width: 600px; margin: 20px auto; background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
// //             <img src="https://res.cloudinary.com/dy8crd62e/image/upload/v1717429749/gamaliel_gaoa0t.png" alt="Logo Veterinaria Gamaliel" style="width: 100%; max-width: 150px; margin: 20px auto; display: block;"/>
// //             <p>Estimado usuario,</p>
// //             <p>Gracias por registrarte en nuestra veterinaria. Para activar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
// //             <div style="text-align: center;">
// //                 <a href="${linkConfirmacion}" style="display: inline-block; padding: 12px 25px; background-color: #ff5f25; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; transition: background-color 0.3s; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);">
// //                     Confirmar Cuenta
// //                 </a>
// //             </div>
// //             ${email && password ? `
// //             <h2 style="color: #ff5f25;">Credenciales de Acceso</h2>
// //             <div style="background: rgba(249, 249, 249, 0.9); padding: 15px; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
// //                 <p><strong>Correo:</strong> ${email}</p>
// //                 <p><strong>Contraseña:</strong> ${password}</p>
// //             </div>` : ""}
// //             <p>¡Esperamos verte pronto!</p>
// //             <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
// //         </div>

// //         <div style="background: linear-gradient(180deg, rgba(253,174,135,1) 0%, rgba(254,99,43,1) 55%); color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);">
// //             <p style="margin: 0;">Dirección: Beijing casi Dorbigni, Cochabamba, Bolivia</p>
// //             <p style="margin: 0;">Teléfono: +591 67477923</p>
// //         </div>
// //     </div>

// // </body>
// // </html>
// // `;

// const plantillaEmail = (linkConfirmacion: string, email?: string, password?: string, token?: string, tipo: 'verificacion' | 'dobleFactor' | 'reestablecer' = 'verificacion') => {
//   let contenidoEspecifico = '';

//   if (tipo === 'verificacion') {
//     contenidoEspecifico = `
//       <p>Estimado usuario,</p>
//       <p>Gracias por registrarte en nuestra veterinaria. Para activar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
//       <div style="text-align: center;">
//           <a href="${linkConfirmacion}" style="display: inline-block; padding: 12px 25px; background-color: #ff5f25; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; transition: background-color 0.3s; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);">
//               Confirmar Cuenta
//           </a>
//       </div>
//       ${email && password ? `
//       <h2 style="color: #ff5f25;">Credenciales de Acceso</h2>
//       <div style="background: rgba(249, 249, 249, 0.9); padding: 15px; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
//           <p><strong>Correo:</strong> ${email}</p>
//           <p><strong>Contraseña:</strong> ${password}</p>
//       </div>` : ""}
//       <p>¡Esperamos verte pronto!</p>`;
//   } else if (tipo === 'dobleFactor') {
//     contenidoEspecifico = `
//       <p>Tu código de ingreso es: <strong>${token}</strong></p>
//       <p>Utiliza este código para completar el proceso de autenticación de doble factor.</p>`;
//   } else if (tipo === 'reestablecer') {
//     contenidoEspecifico = `
//       <p>Haz clic en el siguiente enlace para reestablecer tu contraseña:</p>
//       <div style="text-align: center;">
//           <a href="${linkConfirmacion}" style="display: inline-block; padding: 12px 25px; background-color: #ff5f25; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; transition: background-color 0.3s; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);">
//               Reestablecer Contraseña
//           </a>
//       </div>`;
//   }

//   return `
//   <!DOCTYPE html>
//   <html lang="es">
//   <head>
//       <meta charset="UTF-8">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>Veterinaria Gamaliel</title>
//   </head>
//   <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: radial-gradient(circle, rgba(253,174,135,0.7) 35%, rgba(254,99,43,0.7) 100%), url('https://res.cloudinary.com/dy8crd62e/image/upload/v1726963191/fondo_uziwcb.png'); background-size: cover; background-repeat: no-repeat; background-position: center; color: #333;">
//       <div style="position: relative; z-index: 1;">
//           <div style="padding: 20px; text-align: center;">
//               <h1 style="margin: 0; color: white;">Veterinaria Gamaliel</h1>
//           </div>
//           <div style="max-width: 600px; margin: 20px auto; background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
//               <img src="https://res.cloudinary.com/dy8crd62e/image/upload/v1717429749/gamaliel_gaoa0t.png" alt="Logo Veterinaria Gamaliel" style="width: 100%; max-width: 150px; margin: 20px auto; display: block;"/>
//               ${contenidoEspecifico}
//               <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
//           </div>
//           <div style="background: linear-gradient(180deg, rgba(253,174,135,1) 0%, rgba(254,99,43,1) 55%); color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);">
//               <p style="margin: 0;">Dirección: Beijing casi Dorbigni, Cochabamba, Bolivia</p>
//               <p style="margin: 0;">Teléfono: +591 67477923</p>
//           </div>
//       </div>
//   </body>
//   </html>`;
// };


// export const enviarCorreodeVerificacion = async (email: string, token: string, password?: string) => {
//   const linkConfirmacion = `${process.env.NEXT_PUBLIC_APP_URL}/auth/nueva-verificacion?token=${token}`;
  
//   if (!process.env.SMTP_USER) {
//     throw new Error("SMTP_USER no está definido en las variables de entorno");
//   }

//   const sender = {
//     name: "VETERINARIA GAMALIEL",
//     address: process.env.SMTP_USER,
//   };

//   const receipients = [
//     {
//       name: "Nuevo Usuario",
//       address: email,
//     },
//   ];

//   const subject = "Confirma tu Dirección de Correo Electrónico";

//   const message = plantillaEmail(linkConfirmacion, email, password);

//   return sendMail({
//     sender,
//     receipients,
//     subject,
//     message
//   });
// };

// export const enviarTokenDobleFactorEmail = async (email: string, token: string) => {
//   const message = plantillaEmail('', email, '', token, 'dobleFactor');
//   // Enviar el correo usando nodemailer
// };

// export const enviarCorreodeReestablecimientodePassword = async (email: string, token: string) => {
//   const linkConfirmacion = `${process.env.NEXT_PUBLIC_APP_URL}/auth/nuevo-password?token=${token}`;
//   const message = plantillaEmail(linkConfirmacion, email, '', '', 'reestablecer');
//   // Enviar el correo usando nodemailer
// };

import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as SMTPTransport.Options);

type EnviarEmailDto = {
  sender: Mail.Address;
  receipients: Mail.Address[];
  subject: string;
  message: string | undefined;
};

export const sendMail = async (dto: EnviarEmailDto) => {
  const { sender, receipients, subject, message } = dto;
  return transporter.sendMail({
    from: sender,
    to: receipients,
    subject,
    html: message,
    text: message,
  });
};

const plantillaEmail = (
  linkConfirmacion: string,
  email?: string,
  password?: string,
  token?: string,
  tipo: "verificacion" | "dobleFactor" | "reestablecer" = "verificacion"
) => {
  let contenidoEspecifico = "";

  if (tipo === "verificacion") {
    contenidoEspecifico = `
      <p>Estimado usuario,</p>
      <p>Gracias por registrarte en nuestra veterinaria. Para activar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:</p>
      <div style="text-align: center;">
          <a href="${linkConfirmacion}" style="display: inline-block; padding: 12px 25px; background-color: #ff5f25; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; transition: background-color 0.3s; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);">
              Confirmar Cuenta
          </a>
      </div>
      ${email && password ? `
      <h2 style="color: #ff5f25;">Credenciales de Acceso</h2>
      <div style="background: rgba(249, 249, 249, 0.9); padding: 15px; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
          <p><strong>Correo:</strong> ${email}</p>
          <p><strong>Contraseña:</strong> ${password}</p>
      </div>` : ""}
      <p>¡Esperamos verte pronto!</p>`;
  } else if (tipo === "dobleFactor") {
    contenidoEspecifico = `
      <p>Tu código de ingreso es: <strong>${token}</strong></p>
      <p>Utiliza este código para completar el proceso de autenticación de doble factor.</p>`;
  } else if (tipo === "reestablecer") {
    contenidoEspecifico = `
      <p>Haz clic en el siguiente enlace para reestablecer tu contraseña:</p>
      <div style="text-align: center;">
          <a href="${linkConfirmacion}" style="display: inline-block; padding: 12px 25px; background-color: #ff5f25; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; transition: background-color 0.3s; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);">
              Reestablecer Contraseña
          </a>
      </div>`;
  }

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Veterinaria Gamaliel</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background: radial-gradient(circle, rgba(253,174,135,0.7) 35%, rgba(254,99,43,0.7) 100%), url('https://res.cloudinary.com/dy8crd62e/image/upload/v1726963191/fondo_uziwcb.png'); background-size: cover; background-repeat: no-repeat; background-position: center; color: #333;">
      <div style="position: relative; z-index: 1;">
          <div style="padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: white;">Veterinaria Gamaliel</h1>
          </div>
          <div style="max-width: 600px; margin: 20px auto; background: rgba(255, 255, 255, 0.9); padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
              <img src="https://res.cloudinary.com/dy8crd62e/image/upload/v1717429749/gamaliel_gaoa0t.png" alt="Logo Veterinaria Gamaliel" style="width: 100%; max-width: 150px; margin: 20px auto; display: block;"/>
              ${contenidoEspecifico}
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </div>
          <div style="background: linear-gradient(180deg, rgba(253,174,135,1) 0%, rgba(254,99,43,1) 55%); color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.2);">
              <p style="margin: 0;">Dirección: Beijing casi Dorbigni, Cochabamba, Bolivia</p>
              <p style="margin: 0;">Teléfono: +591 67477923</p>
          </div>
      </div>
  </body>
  </html>`;
};

export const enviarCorreodeVerificacion = async (email: string, token: string, password?: string) => {
  const linkConfirmacion = `${process.env.NEXT_PUBLIC_APP_URL}/auth/nueva-verificacion?token=${token}`;

  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER no está definido en las variables de entorno");
  }

  const sender = {
    name: "VETERINARIA GAMALIEL",
    address: process.env.SMTP_USER,
  };

  const receipients = [
    {
      name: "Nuevo Usuario",
      address: email,
    },
  ];

  const subject = "Confirma tu Dirección de Correo Electrónico";
  const message = plantillaEmail(linkConfirmacion, email, password);

  return sendMail({
    sender,
    receipients,
    subject,
    message,
  });
};

export const enviarTokenDobleFactorEmail = async (email: string, token: string) => {
  const message = plantillaEmail('', email, '', token, 'dobleFactor');

  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER no está definido en las variables de entorno");
  }
  const sender = {
    name: "VETERINARIA GAMALIEL",
    address: process.env.SMTP_USER,
  };

  const receipients = [
    {
      name: "Usuario Autenticado",
      address: email,
    },
  ];

  const subject = "Código de Doble Factor";
  
  return sendMail({
    sender,
    receipients,
    subject,
    message,
  });
};

export const enviarCorreodeReestablecimientodePassword = async (email: string, token: string) => {
  const linkConfirmacion = `${process.env.NEXT_PUBLIC_APP_URL}/auth/nuevo-password?token=${token}`;
  const message = plantillaEmail(linkConfirmacion, email, '', '', 'reestablecer');

  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER no está definido en las variables de entorno");
  }
  
  const sender = {
    name: "VETERINARIA GAMALIEL",
    address: process.env.SMTP_USER,
  };

  const receipients = [
    {
      name: "Usuario",
      address: email,
    },
  ];

  const subject = "Reestablecer Contraseña";
  
  return sendMail({
    sender,
    receipients,
    subject,
    message,
  });
};
