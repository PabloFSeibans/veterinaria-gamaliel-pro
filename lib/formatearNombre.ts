export function formatearNombre(nombre: string): string {
    nombre = nombre.trim();
    let partes = nombre.split(' ');
    partes = partes
        .filter(parte => parte !== '')
        .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase());
    return partes.join(' ');
}
