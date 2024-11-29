export const generarPassword = (length: number = 8): string => {
	const lowercase = "abcdefghijklmnopqrstuvwxyz";
	const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numbers = "0123456789";
	const special = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
	const allChars = lowercase + uppercase + numbers + special;
  
	let password: string[] = [];
  
	// Garantizamos al menos un carácter de cada tipo
	password.push(lowercase[Math.floor(Math.random() * lowercase.length)]);
	password.push(uppercase[Math.floor(Math.random() * uppercase.length)]);
	password.push(numbers[Math.floor(Math.random() * numbers.length)]);
	password.push(special[Math.floor(Math.random() * special.length)]);
  
	// Rellenamos la contraseña hasta alcanzar la longitud deseada
	while (password.length < length) {
	  password.push(allChars[Math.floor(Math.random() * allChars.length)]);
	}
  
	// Mezclamos la contraseña para evitar patrones predecibles
	return password.sort(() => Math.random() - 0.5).join("");
  };
  