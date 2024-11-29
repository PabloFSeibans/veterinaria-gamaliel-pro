/**
 * Formatea un texto dado, normalizando espacios, capitalización y puntuación.
 * @param input - El texto a formatear, puede ser string, null o undefined.
 * @returns El texto formateado o el valor original si es null o undefined.
 */
export const formatearDetalle = (input: string | null | undefined): string | null | undefined => {
	// Si la entrada es null o undefined, retornar el valor original
	if (input == null) return input;
  
	// Convertir a string y eliminar espacios al inicio y al final
	let formattedText = input.trim();
  
	// Reemplazar múltiples espacios con un solo espacio
	formattedText = formattedText.replace(/\s+/g, ' ');
  
	// Normalizar puntuación: reemplazar múltiples puntos o comas con uno solo
	formattedText = formattedText.replace(/\.{2,}/g, '.').replace(/,{2,}/g, ',');
  
	// Asegurar que hay un espacio después de cada punto o coma, pero no antes
	formattedText = formattedText.replace(/([.,])(?!\s|$)/g, '$1 ');
	formattedText = formattedText.replace(/\s([.,])/g, '$1');
  
	// Capitalizar la primera letra de cada oración
	formattedText = formattedText.replace(
	  /(^\w|\.\s+\w)/g,
	  match => match.toUpperCase()
	);
  
	// Convertir el resto del texto a minúsculas, excluyendo la primera letra de cada oración
	formattedText = formattedText.replace(
	  /\S+/g,
	  word => word.charAt(0) + word.slice(1).toLowerCase()
	);
  
	// Eliminar espacios antes del final de la oración
	formattedText = formattedText.replace(/\s+\./g, '.');
  
	return formattedText;
  };
  
  // Ejemplo de uso:
  // const result = formatText("HOLA A TODOS MUCHO      GUSTO EN CONOCERLOS... ME AGRADAN MUCHO.,, es verdad   que me agradan mucho..");
  // console.log(result);
  // Output: "Hola a todos mucho gusto en conocerlos. Me agradan mucho. Es verdad que me agradan mucho."