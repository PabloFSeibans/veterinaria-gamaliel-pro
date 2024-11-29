type Usuario = {
	id: number;
	name: string;
	apellidoPat: string;
	apellidoMat: string;
};

export function actualizarNombres(nombreCompleto: string): Partial<Usuario> {
	// Convertir a minúsculas para trabajar con una base uniforme
	nombreCompleto = nombreCompleto.toLowerCase();

	// Dividir el nombre completo en partes
	const partes = nombreCompleto.split(/\s+/).filter(part => part !== '');

	// Convertir la primera letra de cada parte a mayúscula
	const partesCapitalizadas = partes.map(parte =>
		parte.charAt(0).toUpperCase() + parte.slice(1)
	);

	// Inicializar variables
	let nombre = "";
	let apellidoPat = "";
	let apellidoMat = "";

	// Asignar nombre y apellidos según el número de palabras
	if (partesCapitalizadas.length === 1) {
		nombre = partesCapitalizadas[0];
	} else if (partesCapitalizadas.length === 2) {
		nombre = partesCapitalizadas[0];
		apellidoPat = partesCapitalizadas[1];
	} else if (partesCapitalizadas.length === 3) {
		nombre = partesCapitalizadas[0];
		apellidoPat = partesCapitalizadas[1];
		apellidoMat = partesCapitalizadas[2];
	} else {
		nombre = partesCapitalizadas.slice(0, partesCapitalizadas.length - 2).join(' ');
		apellidoPat = partesCapitalizadas[partesCapitalizadas.length - 2];
		apellidoMat = partesCapitalizadas[partesCapitalizadas.length - 1];
	}

	return {
		name: nombre.trim(),
		apellidoPat: apellidoPat.trim(),
		apellidoMat: apellidoMat.trim(),
	};
}

// 	// Caso especial: Si el nombre tiene solo una palabra
// 	if (partesCapitalizadas.length === 1) {
// 		nombre = partesCapitalizadas[0];
// 	}
// 	// Caso especial: Si el nombre tiene dos palabras
// 	else if (partesCapitalizadas.length === 2) {
// 		nombre = partesCapitalizadas[0];
// 		apellidoPat = partesCapitalizadas[1];
// 	}
// 	// Caso especial: Si el nombre tiene tres palabras
// 	else if (partesCapitalizadas.length === 3) {
// 		nombre = partesCapitalizadas[0];
// 		apellidoPat = partesCapitalizadas[1];
// 		apellidoMat = partesCapitalizadas[2];
// 	}
// 	// Caso general: Si el nombre tiene más de tres palabras
// 	else {
// 		// Verificar si hay palabras específicas de apellido
// 		if (['del', 'de', 'la', 'los'].some(apellido => partes.includes(apellido))) {
// 			nombre = partesCapitalizadas.shift() || "";
// 			apellidoPat = `${partesCapitalizadas.shift() || ""} ${partesCapitalizadas.shift() || ""}`;
// 			apellidoMat = partesCapitalizadas.shift() || "";
// 		} else {
// 			// Asignar nombre y apellidos según el número de palabras
// 			nombre = partesCapitalizadas.shift() || "";
// 			apellidoPat = partesCapitalizadas.shift() || "";
// 			apellidoMat = partesCapitalizadas.pop() || "";
// 		}
// 		// Si quedan partes intermedias, se añaden al nombre
// 		if (partesCapitalizadas.length > 0) {
// 			nombre += ' ' + partesCapitalizadas.join(' ');
// 		}
// 	}

// Ejemplos de uso
// console.log(actualizarNombres("Pablo Fernandez Aduviri"));
// console.log(actualizarNombres("Lucas SalAzar"));
// console.log(actualizarNombres("pepe toño macias angulo"));
// console.log(actualizarNombres("LucCILLE"));
// console.log(actualizarNombres("LUIS BARRIENtos k SALAZAR MEDINA SOPA"));
// console.log(actualizarNombres("Pablo Fernandez      Aduviri"));
// console.log(actualizarNombres("Lucas SalAzar"));
// console.log(actualizarNombres("pepe toño macias angulo"));
// console.log(actualizarNombres("LucCILLE"));
// console.log(actualizarNombres("LUIS BARRIENtos k SALAZAR MEDINA SOPA"));
