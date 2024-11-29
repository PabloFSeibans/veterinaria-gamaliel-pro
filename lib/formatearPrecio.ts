// export const formatearPrecio = (precio: string | number | null) => {
// 	if (precio === null || precio === "") return "No hay precio";
// 	const precioNumerico = typeof precio === "string" ? parseFloat(precio) : precio;
// 	return new Intl.NumberFormat("es-BO", {
// 	  style: "currency",
// 	  currency: "BOB",
// 	}).format(precioNumerico);
//   }

// export const formatearPrecio = (precio: string | number | null) => {
// 	if (precio === null || precio === "") return "No hay precio";
// 	const precioNumerico = typeof precio === "string" ? parseFloat(precio) : precio;
// 	return new Intl.NumberFormat("es-BO", {
// 	  style: "currency",
// 	  currency: "BOB",
// 	  minimumFractionDigits: 2,
// 	  maximumFractionDigits: 2,
// 	}).format(precioNumerico).replace(",", ".");
//   };
export const formatearPrecio = (precio: string | number | null) => {
	if (precio === null || precio === "") return "No hay precio";
	const precioNumerico = typeof precio === "string" ? parseFloat(precio) : precio;
	if (isNaN(precioNumerico)) return "Precio inválido";
	return new Intl.NumberFormat("es-BO", {
		style: "currency",
		currency: "BOB",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(precioNumerico).replace(",", ".");
};

//TODO:Los de abajo no se usan
export const formatearPrecioPorcentaje = (precio: number, porcentaje: number) => {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(precio * porcentaje / 100);
}

export const formatearPrecioPorcentajePorDia = (precio: number, porcentaje: number) => {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(precio * porcentaje / 100 / 365);
}