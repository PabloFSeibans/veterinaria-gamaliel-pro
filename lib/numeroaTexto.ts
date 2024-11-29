// const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
// const decenas = ['diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
// const especiales = ['once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve']

// export function numeroATexto(numero: string): string {

//   const numeroF = parseInt(numero)
//   // if(typeof numero == "string") return numero;
//   const partes = numeroF.toFixed(2).split('.')
//   const entero = parseInt(partes[0])
//   const decimal = parseInt(partes[1])

//   let resultado = ''

//   if (entero === 0) {
//     resultado = 'cero'
//   } else if (entero <= 9) {
//     resultado = unidades[entero]
//   } else if (entero <= 19) {
//     resultado = especiales[entero - 11]
//   } else if (entero <= 99) {
//     const unidad = entero % 10
//     const decena = Math.floor(entero / 10)
//     resultado = decenas[decena - 1]
//     if (unidad > 0) {
//       resultado += ' y ' + unidades[unidad]
//     }
//   } else {
//     resultado = 'número fuera de rango'
//   }

//   resultado += ' Bs.'

//   if (decimal > 0) {
//     resultado += ` Con ${decimal} Centavos.`
//   }

//   return resultado.charAt(0).toUpperCase() + resultado.slice(1)
// }




// function numeroALetras(num) {
//   const unidades = [
//     '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'
//   ];
//   const decenas = [
//     '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
//   ];
//   const especiales = [
//     'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
//   ];
//   const centenas = [
//     '', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
//   ];

//   if (num === 0) return 'CERO';
//   if (num === 100) return 'CIEN';

//   let letras = '';

//   // Para manejar números hasta 10,000
//   if (num >= 1000) {
//     if (num === 1000) {
//       letras = 'MIL ';
//     } else if (num < 2000) {
//       letras = 'MIL ' + numeroALetras(num % 1000);
//     } else {
//       letras = unidades[Math.floor(num / 1000)] + ' MIL ' + numeroALetras(num % 1000);
//     }
//   } else if (num >= 100) {
//     letras = centenas[Math.floor(num / 100)] + ' ' + numeroALetras(num % 100);
//   } else if (num >= 20) {
//     letras = decenas[Math.floor(num / 10)] + (num % 10 > 0 ? ' Y ' + unidades[num % 10] : '');
//   } else if (num >= 11 && num <= 19) {
//     letras = especiales[num - 11];
//   } else {
//     letras = unidades[num];
//   }

//   return letras.trim();
// }

// // Función para convertir el monto a letras, incluyendo decimales
// function convertirMontoCuota(monto) {
//   const enteros = Math.floor(monto);
//   const centavos = Math.round((monto - enteros) * 100);

//   const letrasEnteros = numeroALetras(enteros);
//   const letrasCentavos = centavos > 0 ? ${centavos}/100 : "00/100";

//   return ${letrasEnteros} ${letrasCentavos} BOLIVIANOS;
// }


const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const especiales = ['ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
const centenas = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

// Función para convertir un número a letras (maneja hasta miles)
function numeroALetras(num: number): string {
  if (num === 0) return 'CERO';
  if (num === 100) return 'CIEN';

  let letras = '';

  if (num >= 1000) {
    if (num === 1000) {
      letras = 'MIL ';
    } else if (num < 2000) {
      letras = 'MIL ' + numeroALetras(num % 1000);
    } else {
      letras = unidades[Math.floor(num / 1000)] + ' MIL ' + numeroALetras(num % 1000);
    }
  } else if (num >= 100) {
    letras = centenas[Math.floor(num / 100)] + ' ' + numeroALetras(num % 100);
  } else if (num >= 20) {
    letras = decenas[Math.floor(num / 10)] + (num % 10 > 0 ? ' Y ' + unidades[num % 10] : '');
  } else if (num >= 11 && num <= 19) {
    letras = especiales[num - 11];
  } else {
    letras = unidades[num];
  }

  return letras.trim();
}

// Función para convertir el monto a letras, incluyendo decimales (como string)
export function numeroATexto(monto: string): string {
  // Convertir la cadena de texto a número flotante
  const numeroF = parseFloat(monto);

  if (isNaN(numeroF)) {
    throw new Error("El valor proporcionado no es un número válido.");
  }

  const enteros = Math.floor(numeroF);
  const centavos = Math.round((numeroF - enteros) * 100);

  const letrasEnteros = numeroALetras(enteros);
  const letrasCentavos = centavos > 0 ? `${centavos}/100` : "00/100";

  return `${letrasEnteros} ${letrasCentavos} BOLIVIANOS`;
}


const unidadesESP = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const decenasESP = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const especialesESP = ['ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
const centenasESP = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

// Función para convertir un número a letras con estilo español correcto
function numeroALEtrasEspanyol(num: number): string {

  if (num === 0) return 'CERO';
  if (num === 100) return 'CIEN';

  let letras = '';

  if (num >= 1000) {
    if (num === 1000) {
      letras = 'MIL ';
    } else if (num < 2000) {
      letras = 'MIL ' + numeroALEtrasEspanyol(num % 1000);
    } else {
      letras = unidadesESP[Math.floor(num / 1000)] + ' MIL ' + numeroALEtrasEspanyol(num % 1000);
    }
  } else if (num >= 100) {
    letras = centenasESP[Math.floor(num / 100)] + (num % 100 === 0 ? '' : ' ' + numeroALEtrasEspanyol(num % 100));
  } else if (num === 10) {
    letras = decenasESP[1]; // Manejo específico para el número 10
  } else if (num >= 20) {
    letras = decenasESP[Math.floor(num / 10)] + (num % 10 > 0 ? ' Y ' + unidadesESP[num % 10] : '');
  } else if (num >= 11 && num <= 19) {
    letras = especialesESP[num - 11];
  } else {
    letras = unidadesESP[num];
  }

  // return letras.trim();
  return letras;
}

// Función para convertir un monto a letras, incluyendo decimales (como string) en formato español
export function convertirNumeroEspanyol(monto: string): string {
  const numeroF = parseFloat(monto);

  if (isNaN(numeroF)) {
    throw new Error("El valor proporcionado no es un número válido.");
  }

  const enteros = Math.floor(numeroF);
  const centavos = Math.round((numeroF - enteros) * 100);

  const letrasEnteros = numeroALEtrasEspanyol(enteros);
  const letrasCentavos = centavos > 0 ? `${centavos}/100` : "00/100";

  return `${letrasEnteros} ${letrasCentavos} BOLIVIANOS`;
}
