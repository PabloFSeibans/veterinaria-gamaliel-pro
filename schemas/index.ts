// @/schemas/index.ts
import { RolUsuario, Sexo, TipoMascota, TipoMedicamento, MetodoPago } from "@prisma/client";
import * as z from "zod";

export const RegistroSchema = z.object({
    name: z.string().min(2, {
        message: "* El o los Nombres son requeridos"
    }).max(50, {
        message: "* El nombre no puede tener más de 50 caracteres"
    }).refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
        message: "* El nombre solo puede contener letras y espacios"
    }),
    apellidoPat: z.string()
        .min(2, {
            message: "* El apellido paterno es requerido"
        })
        .max(40, {
            message: "* El apellido paterno no puede tener más de 40 caracteres"
        })
        .refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
            message: "* El apellido paterno solo puede contener letras y espacios"
        }),
    apellidoMat: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string().max(40, {
            message: "* El apellido materno no puede tener más de 40 caracteres"
        }).refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
            message: "* El apellido materno solo puede contener letras y espacios"
        })
    )),
    ci: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string().max(18, {
            message: "* El C.I. no puede tener más de 18 caracteres"
        }).refine((value) => /^\d{7,8}(-[A-Z]{2})?$/.test(value), {
            message: "* Ingrese Un C.I. válido"
        })
    )),
    sexo: z.optional(z.enum(["M", "F"])),
    email: z.string({
        invalid_type_error: "Ingrese Caracteres válidos"
    }).email({
        message: "* El Email es requerido"
    }).max(150, {
        message: "* El Email no puede tener más de 150 caracteres"
    }),
    password: z.string().min(6, {
        message: "* La Contraseña debe ser de mínimo 6 caracteres"
    }),
    repetirPassword: z.string().min(6, {
        message: "* La Contraseña Repetida debe ser de mínimo 6 caracteres"
    }),
    celular: z.optional(
        z.string()
            .max(17, {
                message: "* El Celular no puede tener más de 17 caracteres"
            })
            .refine((celular) => /^\+\d{10,15}$/.test(celular),
                "Numero de Celular Invalido")
    ),
    direccion: z.optional(
        z.string()
            .max(255, { message: "La dirección no debe tener más de 255 caracteres." })
    ),
}).refine((data) =>
    data.password === data.repetirPassword, {
    message: "* Las contraseñas no coinciden",
    path: ["repetirPassword"],
});



export const RegistroAdminSchema = z.object({
    name: z.string()
        .min(2, {
            message: "* El o los Nombres son requeridos"
        }).max(50, {
            message: "* El nombre no puede tener más de 50 caracteres"
        }).refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
            message: "* El nombre solo puede contener letras y espacios"
        }),
    apellidoPat: z.string()
        .min(2, {
            message: "* El apellido paterno es requerido"
        })
        .max(40, {
            message: "* El apellido paterno no puede tener más de 40 caracteres"
        })
        .refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
            message: "* El apellido paterno solo puede contener letras y espacios"
        }),
    apellidoMat: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string().max(40, {
            message: "* El apellido materno no puede tener más de 40 caracteres"
        }).refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
            message: "* El apellido materno solo puede contener letras y espacios"
        })
    )),
    ci: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string().max(18, {
            message: "* El C.I. no puede tener más de 18 caracteres"
        }).refine((value) => /^\d{7,8}(-[A-Z]{2})?$/.test(value), {
            message: "* Ingrese Un C.I. válido"
        })
    )),
    sexo: z.optional(z.enum(["M", "F"])),
    email: z.optional(z.string({
        invalid_type_error: "Ingrese Caracteres válidos"
    }).email({
        message: "* El Email es requerido"
    }).max(150, {
        message: "* El Email no puede tener más de 150 caracteres"
    })),
    celular: z.optional(
        z.string()
            .max(17, {
                message: "* El Celular no puede tener más de 17 caracteres"
            })
            .refine((celular) => /^\+\d{10,15}$/.test(celular),
                "Numero de Celular Invalido")
    ),
    direccion: z.optional(
        z.string()
            .max(255, { message: "La dirección no debe tener más de 255 caracteres." })
    ),
    image: z.string().optional(),
    estado: z.optional(z.number().positive({ message: "El estado debe ser un número positivo" })),
    archivo: z.instanceof(File).optional(),
    rol: z.nativeEnum(RolUsuario, {
        errorMap: () => ({ message: "El tipo de usuario es inválido" })
    }),
    especialidades: z.string().nullable().optional(),
});

export const LoginSchema = z.object({
    email: z.string({
        invalid_type_error: "Ingrese Caracteres válidos"
    }).email({
        message: "* El Email es requerido"
    }),
    password: z.string().min(1, {
        message: "* La Contraseña es requerida"
    }),
    codigo: z.optional(z.string()),
});

export const NuevoPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "* La Contraseña debe ser de mínimo 6 caracteres"
    })
});

export const CambiarPasswordSchema = z.object({
    password: z.optional(
        z.string().min(6, {
            message: "* La Contraseña debe ser de mínimo 6 caracteres"
        })
    ),
    nuevoPassword: z.optional(
        z.string().min(6, {
            message: "* La Nueva Contraseña debe ser de mínimo 6 caracteres"
        })
    ),
    repetirPassword: z.optional(
        z.string().min(6, {
            message: "* La Contraseña Repetida debe ser de mínimo 6 caracteres"
        })
    ),
}).refine((data) => {
    if (data.password && !data.nuevoPassword) {
        return false;
    }
    return true;
}, {
    message: "Su Nueva Contraseña es Necesaria",
    path: ["nuevoPassword"],
}).refine((data) => {
    if (data.nuevoPassword && !data.password) {
        return false;
    }
    return true;
}, {
    message: "Su Contraseña es Necesaria",
    path: ["password"],
}).refine((data) =>
    data.nuevoPassword === data.repetirPassword, {
    message: "* Las contraseñas no coinciden",
    path: ["repetirPassword"],
});

export const ResetSchema = z.object({
    email: z.string({
        invalid_type_error: "Ingrese Caracteres válidos"
    }).email({
        message: "* El Email es requerido"
    })
});


export const ConfiguracionSchema = z.object({
    name: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string().min(2, {
            message: "* El o los Nombres son requeridos"
        }).max(50, {
            message: "* El nombre no puede tener más de 50 caracteres"
        }).refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
            message: "* El nombre solo puede contener letras y espacios"
        })
    )),
    apellidoPat: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string()
            .min(2, {
                message: "* El apellido paterno es requerido"
            })
            .max(40, {
                message: "* El apellido paterno no puede tener más de 40 caracteres"
            })
            .refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
                message: "* El apellido paterno solo puede contener letras y espacios"
            })
    )),
    apellidoMat: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string().max(40, {
            message: "* El apellido materno no puede tener más de 40 caracteres"
        }).refine((value) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
            message: "* El apellido materno solo puede contener letras y espacios"
        })
    )),
    ci: z.preprocess((value) => value === "" ? undefined : value, z.optional(
        z.string().max(18, {
            message: "* El C.I. no puede tener más de 18 caracteres"
        }).refine((value) => /^\d{7,8}(-[A-Z]{2})?$/.test(value), {
            message: "* Ingrese Un C.I. válido"
        })
    )),
    sexo: z.preprocess(
        (value) => value === undefined || value === "" ? undefined : value,
        z.optional(z.enum(["M", "F"]))
    ),
    email: z.optional(z.string().email()),
    rol: z.nativeEnum(RolUsuario, {
        errorMap: () => ({ message: "El tipo de usuario es inválido" })
    }),

    celular: z.optional(z.string().refine((celular) => /^\+\d{10,15}$/.test(celular), "Numero de Celular Invalido")),
    direccion: z.optional(z.string()
        .max(255, { message: "La dirección no debe tener más de 255 caracteres." }),
    ),
    estado: z.optional(z.number().positive({ message: "El estado debe ser un número positivo" })),
    authDobleFactor: z.optional(z.boolean()),
});

export const MascotaSchema = z.object({
    nombre: z.string()
        .min(1, "El nombre es obligatorio")
        .max(50, "El nombre no puede tener más de 50 caracteres"),
    // especie: z.nativeEnum(TipoMascota, {
    //     errorMap: () => ({ message: "Por favor selecciona la especie" })
    // }),
    especie: z.nativeEnum(TipoMascota, {
        required_error: "Por favor selecciona la especie",
        invalid_type_error: "Por favor selecciona una especie válida"
    }),
    raza: z.string()
        .min(1, "La raza es obligatoria")
        .max(40, "La raza no puede tener más de 40 caracteres"),
    fechaNacimiento: z.optional(z.date().refine(date => date < new Date(), {
        message: "La fecha de nacimiento no puede ser futura",
    })),
    // sexo: z.enum([Sexo.Macho, Sexo.Hembra], {
    //     required_error: "El género es obligatorio",
    //     message: "Por favor selecciona el género de la mascota",
    // }),
    // sexo: z.nativeEnum(Sexo, {
    //     errorMap: () => ({ message: "Por favor selecciona el género de la mascota" })
    //   }),
    sexo: z.nativeEnum(Sexo, {
        required_error: "Por favor selecciona el género de la mascota",
        invalid_type_error: "Por favor selecciona un género válido"
    }),
    detalles: z.optional(
        z.string()
            .max(255, { message: "La descripción no debe tener más de 255 caracteres." })
    ),
    imagen: z.string().optional(),
    idPropietario: z.preprocess(
        (val) => val === "" || val === null ? undefined : Number(val),
        z.number({
            required_error: "El propietario es obligatorio",
            invalid_type_error: "El propietario es obligatorio",
        }).positive("el propietario es obligatorio")
    ),

    peso: z.string({
        required_error: "El peso es obligatorio",
    }).min(1, "El peso es obligatorio")
        .regex(/^\d{1,3}(\.\d{1,2})?$/, "Usa el formato correcto: hasta 3 dígitos enteros y 2 decimales")
        .refine((val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0 && num <= 999.99;
        }, "El peso debe ser mayor que 0 y no exceder 999.99 kg"),
    esterilizado: z.boolean().optional(),
    estado: z.optional(z.string()),
    // estado: z.preprocess((val) => parseInt(val as string, 10), z.number().positive({ message: "El estado debe ser un número positivo" })),
    archivo: z.instanceof(File).optional(),
});

// fechaNacimiento: z.date().refine(value => value !== undefined, {
//     message: "La fecha de nacimiento es obligatoria",
//     path: ['fechaNacimiento']
// }),

export const MedicamentoSchema = z.object({
    codigo: z.optional(
        z.string()
            .max(50, { message: "El código no puede tener más de 50 caracteres" }),
    ),
    nombre: z.string()
        .min(1, { message: "El nombre es obligatorio" })
        .max(100, { message: "El nombre no puede tener más de 100 caracteres" }),
    descripcion: z.string()
        .max(150, { message: "La descripción no puede tener más de 150 caracteres" })
        .optional(),
    indicaciones: z.string()
        .max(200, { message: "Las indicaciones no pueden tener más de 200 caracteres" })
        .optional(),
    unidadMedida: z.string()
        .max(50, { message: "La unidad de medicamento no puede tener más de 50 caracteres" })
        .optional(),
    cantidadPorUnidad: z.preprocess((val) => parseInt(val as string, 10), z.number().positive({ message: "La cantidad por unidad debe ser un número positivo" })),
    stock: z.preprocess((val) => parseInt(val as string, 10), z.number().positive({ message: "El stock debe ser un número positivo" })),
    precio: z
        .string({
            required_error: "El precio es requirido",
        })
        .min(1, "El precio es requerido")
        .refine(
            (value) => {
                const numericValue = parseFloat(value);
                return !isNaN(numericValue) && numericValue >= 0 && numericValue <= 10000;
            },
            {
                message: "El precio debe ser un número entre 0 y 10000",
            }
        )
        .transform((value) => parseFloat(value).toFixed(2)),
    sobrante: z.preprocess((val) => parseInt(val as string, 10), z.number().positive({ message: "El sobrante debe ser un número positivo" })).optional(),
    imagen: z.string().min(1, "Debe subir una Imagen del Medicamento"),
    tipo: z.nativeEnum(TipoMedicamento, {
        errorMap: () => ({ message: "El tipo de medicamento es inválido" })
    }),
    archivo: z.instanceof(File).optional(),
});

export const ServicioSchema = z.object({
    nombre: z.string({
        required_error: "El nombre es requerido",
    })
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede tener más de 100 caracteres'),
    descripcion: z.string({
        required_error: "La descripción es requerida",
    })
        .min(1, 'La descripción es requerida')
        .max(200, 'La descripción no puede tener más de 200 caracteres'),
    precio: z
        .string({
            required_error: "El precio es requirido",
        })
        .min(1, "El precio es requerido")
        .refine(
            (value) => {
                const numericValue = parseFloat(value);
                return !isNaN(numericValue) && numericValue >= 0 && numericValue <= 100000;
            },
            {
                message: "El precio debe ser un número entre 0 y 100000",
            }
        )
        .transform((value) => parseFloat(value).toFixed(2)),
});

export const ReservaMedicaSchema = z.object({
    fechaReserva: z
        .date({
            required_error: "La fecha y hora de reserva son requeridas.",
        }),
    detalles: z
        .string({
            required_error: "Los detalles son requeridos.",
        })
        .min(1, {
            message: "Los detalles son requeridos.",
        })
        .max(150, {
            message: "Los detalles no pueden exceder los 150 caracteres.",
        }),
    estado: z
        .number({
            required_error: "El estado es requerido.",
        })
        .int()
        .min(1, { message: "El estado debe ser al menos Pendiente." })
        .max(3, { message: "El estado no puede ser un valor diferente." }),
    usuarioId: z
        .number({
            required_error: "Debe seleccionar un usuario para la reserva.",
        })
        .int()
        .positive({
            message: "El ID del usuario debe ser un número positivo.",
        }),
});

export const CrearReservaMedicaSchema = ReservaMedicaSchema.extend({
    fechaReserva: z
        .date({
            required_error: "La fecha y hora de reserva son requeridas.",
        })
        .refine((date) => {
            const now = new Date();
            return date > now && (date.getHours() !== 0 || date.getMinutes() !== 0);
        }, {
            message: "La fecha y hora deben ser futuras y válidas.",
        }),
});

// Esquema para reservas de usuarios normales
export const ReservaUsuarioSchema = z.object({
    fechaReserva: z
        .date({
            required_error: "La fecha y hora de reserva son requeridas.",
        })
        .superRefine((date, ctx) => {
            const now = new Date();
            if (date <= now || (date.getHours() === 0 && date.getMinutes() === 0)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "La fecha y hora deben ser futuras y válidas.",
                });
                return false;
            }
            return true;
        }),
    detalles: z
        .string({
            required_error: "Los detalles son requeridos.",
        })
        .min(1, {
            message: "Los detalles son requeridos.",
        })
        .max(150, {
            message: "Los detalles no pueden exceder los 150 caracteres.",
        }),
});

export const CrearReservaUsuarioSchema = ReservaUsuarioSchema.extend({
    fechaReserva: z
        .date({
            required_error: "La fecha y hora de reserva son requeridas.",
        })
        .refine((date) => {
            const now = new Date();
            return date > now && (date.getHours() !== 0 || date.getMinutes() !== 0);
        }, {
            message: "La fecha y hora deben ser futuras y válidas.",
        }),
});

export const SubirImagenSquema = z.object({
    archivo: z
        .instanceof(File)
        .refine((file) => file instanceof File, {
            message: "El archivo es obligatorio y debe ser de tipo File",
        }),
});

const TratamientoMedicamentoSchema = z.object({
    medicamentoId: z.number().int().positive(),
    cantidad: z.number().int().positive(),
    costoUnitario: z.string().regex(/^\d+(\.\d{1,2})?$/),
    dosificacion: z.string().nullable(),
});

const ServicioTratamientoSchema = z.object({
    servicioId: z.number().int().positive(),
    precioServicio: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

export const TratamientoFormSchema = z.object({
    descripcion: z.string()
        .min(1, "La descripción es requerida")
        .max(100, "La descripción no puede tener más de 100 caracteres"),
    diagnostico: z.string().optional().nullable(),
    estado: z.number().int(),
    historialMascotaId: z.number().int().positive(),
    medicamentos: z.array(TratamientoMedicamentoSchema).optional(),
    servicios: z.array(ServicioTratamientoSchema).optional(),
    total: z.number(),
    detalle:
        z.optional(
            z.string().nullable()
        ),
    esAyudaVoluntaria:
        z.boolean(),
});


export const PagoSchema = z.object({
    metodoPago: z.nativeEnum(MetodoPago, {
        errorMap: () => ({ message: "El método de pago es inválido" })
        //       required_error: "El método de pago es requerido",
    }),
    detalle: z.string()
        .max(100, { message: "El detalle no puede tener más de 100 caracteres" })
        .nullable(),
    estado: z.number()
        .int()
        .min(1, "El estado es inválido")
        .max(3, "El estado es inválido"),
    esAyudaVoluntaria: z.boolean().default(false),
});

export const TratamientoSchema = z.object({
    descripcion: z.string().min(1, "La descripción es requerida").max(100, "La descripción no puede exceder los 100 caracteres"),
    estado: z.coerce.number({
        required_error: "El estado del tratamiento es requerido",
        invalid_type_error: "El estado del tratamiento es inválido"
    }).int().min(1, "Debe seleccionar el estado del tratamiento").max(3, "Estado inválido"),
    diagnostico: z.string().max(255, "El diagnóstico no puede exceder los 255 caracteres").nullable(),
    historialMascotaId: z.number().int().positive(),
    servicios: z.array(z.any()).min(1, "Debe seleccionar al menos un servicio"),
    medicamentos: z.array(z.any()).optional(),
    total: z.number().positive("El total debe ser mayor a 0"),
    detalle: z.string().max(100, "El detalle no puede exceder los 100 caracteres").nullable(),
    esAyudaVoluntaria: z.boolean(),
});


export type TratamientoSchemaType = z.infer<typeof TratamientoSchema>;
