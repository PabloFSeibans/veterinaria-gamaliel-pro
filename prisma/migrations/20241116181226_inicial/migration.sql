-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `usuario` VARCHAR(100) NULL,
    `apellidoPat` VARCHAR(40) NULL,
    `apellidoMat` VARCHAR(40) NULL,
    `ci` VARCHAR(18) NULL,
    `sexo` VARCHAR(1) NULL,
    `correo` VARCHAR(150) NULL,
    `correoVerificado` DATETIME(3) NULL,
    `imagen` VARCHAR(255) NULL,
    `contrasena` VARCHAR(200) NULL,
    `rol` ENUM('Administrador', 'Usuario', 'Veterinario') NOT NULL DEFAULT 'Usuario',
    `celular` VARCHAR(17) NULL,
    `direccion` VARCHAR(100) NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `especialidades` TEXT NULL,
    `autenticacionDobleFactor` BOOLEAN NOT NULL DEFAULT false,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `Usuario_usuario_key`(`usuario`),
    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cuenta` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER UNSIGNED NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `proveedor` VARCHAR(50) NOT NULL,
    `idCuentaProveedor` VARCHAR(100) NOT NULL,
    `tokenActualizacion` TEXT NULL,
    `tokenAcceso` TEXT NULL,
    `expiraEn` INTEGER NULL,
    `tipoToken` VARCHAR(50) NULL,
    `alcance` VARCHAR(255) NULL,
    `idToken` TEXT NULL,
    `estadoSesion` VARCHAR(100) NULL,
    `tokenActualizacionExpiraEn` INTEGER NULL,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,

    UNIQUE INDEX `Cuenta_usuarioId_key`(`usuarioId`),
    INDEX `Cuenta_usuarioId_idx`(`usuarioId`),
    UNIQUE INDEX `Cuenta_proveedor_idCuentaProveedor_key`(`proveedor`, `idCuentaProveedor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenVerificacion` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TokenVerificacion_token_key`(`token`),
    UNIQUE INDEX `TokenVerificacion_email_token_key`(`email`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenReestablecimientoPassword` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TokenReestablecimientoPassword_token_key`(`token`),
    UNIQUE INDEX `TokenReestablecimientoPassword_email_token_key`(`email`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenDobleFactor` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TokenDobleFactor_token_key`(`token`),
    UNIQUE INDEX `TokenDobleFactor_email_token_key`(`email`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConfirmacionDobleFactor` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `ConfirmacionDobleFactor_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mascota` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `imagen` VARCHAR(255) NULL,
    `especie` ENUM('Perro', 'Gato', 'Otro') NOT NULL,
    `raza` VARCHAR(40) NULL,
    `fechaNacimiento` DATE NULL,
    `sexo` ENUM('Macho', 'Hembra') NOT NULL,
    `detalles` VARCHAR(150) NULL,
    `peso` FLOAT NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `idPropietario` INTEGER UNSIGNED NULL DEFAULT 1,
    `esterilizado` BOOLEAN NULL DEFAULT false,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `Mascota_id_idPropietario_key`(`id`, `idPropietario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialMedico` (
    `historialMascotaId` INTEGER UNSIGNED NOT NULL,
    `descripcionTratamientos` TEXT NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `HistorialMedico_historialMascotaId_key`(`historialMascotaId`),
    PRIMARY KEY (`historialMascotaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Servicio` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(200) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `Servicio_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tratamiento` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(100) NOT NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `diagnostico` VARCHAR(255) NULL,
    `historialMascotaId` INTEGER UNSIGNED NOT NULL,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServicioTratamiento` (
    `precioServicio` DECIMAL(10, 2) NOT NULL,
    `servicioId` INTEGER UNSIGNED NOT NULL,
    `tratamientoId` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`servicioId`, `tratamientoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Medicamento` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `imagen` VARCHAR(255) NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `codigo` VARCHAR(50) NULL,
    `descripcion` VARCHAR(150) NULL,
    `indicaciones` VARCHAR(150) NULL,
    `unidadMedida` VARCHAR(50) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `cantidadPorUnidad` INTEGER NOT NULL DEFAULT 1,
    `sobrante` INTEGER NOT NULL DEFAULT 0,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `precio` DECIMAL(10, 2) NOT NULL,
    `tipo` ENUM('Antiparasitario', 'Antibiotico', 'Aerosol', 'Pastilla', 'Vacuna', 'Crema', 'Suero', 'Suplemento', 'Polvo', 'Gel', 'Otro') NOT NULL,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TratamientoMedicamento` (
    `tratamientoId` INTEGER UNSIGNED NOT NULL,
    `medicamentoId` INTEGER UNSIGNED NOT NULL,
    `cantidad` INTEGER UNSIGNED NOT NULL DEFAULT 1,
    `costoUnitario` DECIMAL(10, 2) NOT NULL,
    `dosificacion` VARCHAR(150) NULL,

    PRIMARY KEY (`tratamientoId`, `medicamentoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pago` (
    `id` INTEGER UNSIGNED NOT NULL,
    `total` DECIMAL(18, 2) NOT NULL,
    `fechaPago` DATETIME(3) NULL,
    `metodoPago` ENUM('Efectivo', 'Transferencia', 'Tarjeta', 'Qr', 'Otro') NULL DEFAULT 'Otro',
    `detalle` VARCHAR(100) NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `esAyudaVoluntaria` BOOLEAN NOT NULL DEFAULT false,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReservaMedica` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `fechaReserva` DATETIME(3) NOT NULL,
    `detalles` VARCHAR(200) NOT NULL,
    `estado` TINYINT NOT NULL DEFAULT 1,
    `usuarioId` INTEGER UNSIGNED NOT NULL,
    `creadoEn` TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizadoEn` TIMESTAMP(3) NULL,
    `idUsuario` INTEGER UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cuenta` ADD CONSTRAINT `Cuenta_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConfirmacionDobleFactor` ADD CONSTRAINT `ConfirmacionDobleFactor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mascota` ADD CONSTRAINT `Mascota_idPropietario_fkey` FOREIGN KEY (`idPropietario`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialMedico` ADD CONSTRAINT `HistorialMedico_historialMascotaId_fkey` FOREIGN KEY (`historialMascotaId`) REFERENCES `Mascota`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tratamiento` ADD CONSTRAINT `Tratamiento_historialMascotaId_fkey` FOREIGN KEY (`historialMascotaId`) REFERENCES `HistorialMedico`(`historialMascotaId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicioTratamiento` ADD CONSTRAINT `ServicioTratamiento_servicioId_fkey` FOREIGN KEY (`servicioId`) REFERENCES `Servicio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicioTratamiento` ADD CONSTRAINT `ServicioTratamiento_tratamientoId_fkey` FOREIGN KEY (`tratamientoId`) REFERENCES `Tratamiento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TratamientoMedicamento` ADD CONSTRAINT `TratamientoMedicamento_tratamientoId_fkey` FOREIGN KEY (`tratamientoId`) REFERENCES `Tratamiento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TratamientoMedicamento` ADD CONSTRAINT `TratamientoMedicamento_medicamentoId_fkey` FOREIGN KEY (`medicamentoId`) REFERENCES `Medicamento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pago` ADD CONSTRAINT `Pago_id_fkey` FOREIGN KEY (`id`) REFERENCES `Tratamiento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReservaMedica` ADD CONSTRAINT `ReservaMedica_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
