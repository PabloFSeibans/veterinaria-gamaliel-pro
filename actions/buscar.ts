'use server'

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { usuarioIdActual } from "@/lib/auth"
import { TipoMascota } from "@prisma/client"

export type ResultadoBusqueda = {
  tipo: 'usuario' | 'mascota' | 'servicio' | 'medicamento' | 'reserva' | 'tratamiento' | 'pago'
  id: number
  titulo: string
  subtitulo?: string
  estado: number
  ruta: string
  metadata?: {
    [key: string]: string | number | null
  }
}

export async function buscarContenido(
  query: string,
  categoria?: string
): Promise<ResultadoBusqueda[]> {
  console.log('🔍 Iniciando búsqueda:', { query, categoria })

  if (!query || query.length < 1) {
    console.log('❌ Búsqueda cancelada: Query vacío')
    return []
  }

  const idUActual = await usuarioIdActual()
  console.log('👤 Usuario actual ID:', idUActual)

  try {
    const buscarUsuarios = async (): Promise<ResultadoBusqueda[]> => {
      if (categoria !== 'todo' && categoria !== 'usuarios' && categoria) {
        console.log('⏭️ Saltando búsqueda de usuarios por categoría:', categoria)
        return []
      }

      console.log('🔎 Buscando usuarios...')
      const usuarios = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { apellidoPat: { contains: query } },
            { apellidoMat: { contains: query } },
            { email: { contains: query } },
            { username: { contains: query } },
            { // Agregado para buscar por nombre completo
              AND: [
                { name: { contains: query.split(' ')[0] } }, // Primer nombre
                { apellidoPat: { contains: query.split(' ')[1] || '' } } // Apellido paterno
              ]
            }
          ],
          estado: { not: 0 },
        },
        select: {
          id: true,
          name: true,
          email: true,
          rol: true,
          estado: true,
          apellidoPat: true,
          apellidoMat: true,
        },
      })
      console.log(`✅ Usuarios encontrados: ${usuarios.length}`)
      // console.log(JSON.stringify(usuarios, null, 2))

      return usuarios.map(usuario => ({
        tipo: 'usuario',
        id: usuario.id,
        titulo: `${usuario.name} ${usuario.apellidoPat || ''} ${usuario.apellidoMat || ''}`.trim(),
        subtitulo: usuario.email || undefined,
        estado: usuario.estado,
        ruta: `/admin/usuarios/${usuario.id}`,
        metadata: {
          rol: usuario.rol,
        },
      }))
    }

    const buscarMascotas = async (): Promise<ResultadoBusqueda[]> => {
      if (categoria !== 'todo' && categoria !== 'mascotas' && categoria) {
        console.log('⏭️ Saltando búsqueda de mascotas por categoría:', categoria)
        return []
      }

      console.log('🔎 Buscando mascotas...')
      const mascotas = await prisma.mascota.findMany({
        where: {
          OR: [
            { nombre: { contains: query } },
            { raza: { contains: query } },
          ],
          estado: { not: 0 },
        },
        include: {
          usuario: {
            select: {
              name: true,
              apellidoPat: true,
              apellidoMat: true,
            },
          },
        },
      })
      console.log(`✅ Mascotas encontradas: ${mascotas.length}`)

      return mascotas.map(mascota => ({
        tipo: 'mascota',
        id: mascota.id,
        titulo: mascota.nombre,
        subtitulo: mascota.usuario ?
          `Dueño: ${mascota.usuario.name} ${mascota.usuario.apellidoPat || ''} ${mascota.usuario.apellidoMat || ''}`.trim() :
          'Sin dueño asignado',
        estado: mascota.estado,
        ruta: `/admin/mascotas/${mascota.id}`,
        metadata: {
          especie: mascota.especie,
          raza: mascota.raza,
          peso: mascota.peso,
          esterilizado: mascota.esterilizado ? 'Sí' : 'No' // Convertir a string
        },
      }))
    }

    const buscarServicios = async (): Promise<ResultadoBusqueda[]> => {
      if (categoria !== 'todo' && categoria !== 'servicios' && categoria) {
        console.log('⏭️ Saltando búsqueda de servicios por categoría:', categoria)
        return []
      }

      console.log('🔎 Buscando servicios...')
      const servicios = await prisma.servicio.findMany({
        where: {
          OR: [
            { nombre: { contains: query } },
            { descripcion: { contains: query } },
          ],
          estado: { not: 0 },
        },
      })
      console.log(`✅ Servicios encontrados: ${servicios.length}`)

      return servicios.map(servicio => ({
        tipo: 'servicio',
        id: servicio.id,
        titulo: servicio.nombre,
        subtitulo: servicio.descripcion,
        estado: servicio.estado,
        ruta: `/admin/servicios/${servicio.id}`,
        metadata: {
          precio: servicio.precio.toString(),
          descripcion: servicio.descripcion
        },
      }))
    }

    const buscarMedicamentos = async (): Promise<ResultadoBusqueda[]> => {
      if (categoria !== 'todo' && categoria !== 'medicamentos' && categoria) {
        console.log('⏭️ Saltando búsqueda de medicamentos por categoría:', categoria)
        return []
      }

      console.log('🔎 Buscando medicamentos...')
      const medicamentos = await prisma.medicamento.findMany({
        where: {
          OR: [
            { nombre: { contains: query } },
            { descripcion: { contains: query } },
            { codigo: { contains: query } },
          ],
          estado: { not: 0 },
        },
      })
      console.log(`✅ Medicamentos encontrados: ${medicamentos.length}`)

      return medicamentos.map(medicamento => ({
        tipo: 'medicamento',
        id: medicamento.id,
        titulo: medicamento.nombre,
        subtitulo: `${medicamento.tipo} - ${medicamento.descripcion || 'Sin descripción'}`,
        estado: medicamento.estado,
        ruta: `/admin/medicamentos/${medicamento.id}`,
        metadata: {
          stock: medicamento.stock,
          precio: medicamento.precio.toString(),
          tipo: medicamento.tipo,
          codigo: medicamento.codigo
        },
      }))
    }

    const buscarReservas = async (): Promise<ResultadoBusqueda[]> => {
      if (categoria !== 'todo' && categoria !== 'reservas' && categoria) {
        console.log('⏭️ Saltando búsqueda de reservas por categoría:', categoria)
        return []
      }

      console.log('🔎 Buscando reservas...')
      const reservas = await prisma.reservaMedica.findMany({
        where: {
          OR: [
            { detalles: { contains: query } },
            {
              usuario: {
                OR: [
                  { name: { contains: query } },
                  { email: { contains: query } }
                ]
              }
            },
          ],
          estado: { not: 0 },
        },
        include: {
          usuario: {
            select: {
              name: true,
              email: true,
              apellidoPat: true,
              apellidoMat: true,
            },
          },
        },
      })
      console.log(`✅ Reservas encontradas: ${reservas.length}`)

      return reservas.map(reserva => ({
        tipo: 'reserva',
        id: reserva.id,
        titulo: `Reserva: ${reserva.usuario.name} ${reserva.usuario.apellidoPat || ''} ${reserva.usuario.apellidoMat || ''}`.trim(),
        subtitulo: reserva.detalles,
        estado: reserva.estado,
        ruta: `/admin/reservas/${reserva.id}`,
        metadata: {
          fecha: reserva.fechaReserva.toISOString(),
          email: reserva.usuario.email,
          detalles: reserva.detalles
        },
      }))
    }

    const buscarTratamientos = async (): Promise<ResultadoBusqueda[]> => {
      if (categoria !== 'todo' && categoria !== 'tratamientos' && categoria) {
        console.log('⏭️ Saltando búsqueda de tratamientos por categoría:', categoria)
        return []
      }

      console.log('🔎 Buscando tratamientos...')
      const tratamientos = await prisma.tratamiento.findMany({
        where: {
          OR: [
            { descripcion: { contains: query } },
            { diagnostico: { contains: query } },
            {
              historialMascota: {
                mascota: {
                  nombre: { contains: query }
                }
              }
            },
          ],
          estado: { not: 0 },
        },
        include: {
          historialMascota: {
            include: {
              mascota: {
                select: {
                  nombre: true,
                  especie: true,
                  raza: true,
                },
              },
            },
          },
          pago: true,
        },
      })
      console.log(`✅ Tratamientos encontrados: ${tratamientos.length}`)

      return tratamientos.map(tratamiento => ({
        tipo: 'tratamiento',
        id: tratamiento.id,
        titulo: tratamiento.descripcion,
        subtitulo: `Mascota: ${tratamiento.historialMascota.mascota.nombre} (${tratamiento.historialMascota.mascota.especie})`,
        estado: tratamiento.estado,
        ruta: `/admin/tratamientos/${tratamiento.id}`,
        metadata: {
          diagnostico: tratamiento.diagnostico,
          mascota: tratamiento.historialMascota.mascota.nombre,
          especie: tratamiento.historialMascota.mascota.especie,
          raza: tratamiento.historialMascota.mascota.raza,
          pagado: tratamiento.pago ? 'Sí' : 'No'
        },
      }))
    }

    // ... código existente ...
    const buscarPagos = async (): Promise<ResultadoBusqueda[]> => {
      if (categoria !== 'todo' && categoria !== 'pagos' && categoria) {
        console.log('⏭️ Saltando búsqueda de pagos por categoría:', categoria)
        return []
      }

      console.log('🔎 Buscando pagos...')
      const pagos = await prisma.pago.findMany({
        where: {
          OR: [
            { detalle: { contains: query } },
            { tratamiento: { descripcion: { contains: query } } },
          ],
          estado: { not: 0 },
        },
        include: {
          tratamiento: {
            select: {
              descripcion: true,
            },
          },
        },
      })
      console.log(`✅ Pagos encontrados: ${pagos.length}`)

      return pagos.map(pago => ({
        tipo: 'pago',
        id: pago.id,
        titulo: `Pago #${pago.id}`,
        subtitulo: pago.tratamiento.descripcion,
        estado: pago.estado,
        ruta: `/admin/pagos/${pago.id}`,
        metadata: {
          total: pago.total.toString(),
          metodoPago: pago.metodoPago,
        },
      }))
    }

    console.log('🚀 Ejecutando búsquedas en paralelo...')
    // ... código existente ...
    const [usuarios, mascotas, servicios, medicamentos, reservas, tratamientos, pagos] =
      await Promise.all([
        buscarUsuarios(),
        buscarMascotas(),
        buscarServicios(),
        buscarMedicamentos(),
        buscarReservas(),
        buscarTratamientos(),
        buscarPagos(), // Agregado para buscar pagos
      ])

    const resultadosFiltrados = [
      ...usuarios,
      ...mascotas,
      ...servicios,
      ...medicamentos,
      ...reservas,
      ...tratamientos,
      ...pagos,
    ].filter(Boolean)

    console.log(`✨ Búsqueda completada. Total de resultados: ${resultadosFiltrados.length}`)
    console.log('📊 Resultados por categoría:', {
      usuarios: usuarios.length,
      mascotas: mascotas.length,
      servicios: servicios.length,
      medicamentos: medicamentos.length,
      reservas: reservas.length,
      tratamientos: tratamientos.length,
      pagos: pagos.length,
    })

    revalidatePath('/')
    console.log(resultadosFiltrados)
    return resultadosFiltrados

  } catch (error) {
    console.error('❌ Error en la búsqueda:', error)
    return []
  }
}





// export async function buscarContenido(
//   query: string,
//   categoria?: string
// ): Promise<ResultadoBusqueda[]> {
//   if (!query || query.length < 1) return []

//   const idUActual = await usuarioIdActual()
//   const queryLower = query.toLowerCase()
//   let resultados: ResultadoBusqueda[] = []

//   try {
//     if (categoria === 'todo' || categoria === 'usuarios' || !categoria) {
//       const usuarios = await prisma.user.findMany({
//         where: {
//           OR: [
//             { name: { contains: queryLower } },
//             { email: { contains: queryLower } },
//             { username: { contains: queryLower } },
//           ],
//           estado: { not: 0 },
//         },
//         select: {
//           id: true,
//           name: true,
//           email: true,
//           rol: true,
//           estado: true,
//         },
//       })


//       resultados.push(
//         ...usuarios.map((usuario) => ({
//           tipo: 'usuario' as const,
//           id: usuario.id,
//           titulo: usuario.name,
//           subtitulo: usuario.email || undefined,
//           estado: usuario.estado,
//           ruta: `/admin/usuarios/${usuario.id}`,
//           metadata: {
//             rol: usuario.rol,
//           },
//         }))
//       )
//     }

//     if (categoria === 'todo' || categoria === 'mascotas' || !categoria) {
//       const mascotas = await prisma.mascota.findMany({
//         where: {
//           OR: [
//             { nombre: { contains: queryLower } },
//             { raza: { contains: queryLower } },
//           ],
//           estado: { not: 0 },
//         },
//         include: {
//           usuario: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       })

//       resultados.push(
//         ...mascotas.map((mascota) => ({
//           tipo: 'mascota' as const,
//           id: mascota.id,
//           titulo: mascota.nombre,
//           subtitulo: mascota.usuario?.name,
//           estado: mascota.estado,
//           ruta: `/admin/mascotas/${mascota.id}`,
//           metadata: {
//             especie: mascota.especie,
//             raza: mascota.raza,
//           },
//         }))
//       )
//     }

//     if (categoria === 'todo' || categoria === 'servicios' || !categoria) {
//       const servicios = await prisma.servicio.findMany({
//         where: {
//           OR: [
//             { nombre: { contains: queryLower } },
//             { descripcion: { contains: queryLower } },
//           ],
//           estado: { not: 0 },
//         },
//       })

//       resultados.push(
//         ...servicios.map((servicio) => ({
//           tipo: 'servicio' as const,
//           id: servicio.id,
//           titulo: servicio.nombre,
//           subtitulo: servicio.descripcion,
//           estado: servicio.estado,
//           ruta: `/admin/servicios/${servicio.id}`,
//           metadata: {
//             precio: servicio.precio.toString(),
//           },
//         }))
//       )
//     }

//     if (categoria === 'todo' || categoria === 'medicamentos' || !categoria) {
//       const medicamentos = await prisma.medicamento.findMany({
//         where: {
//           OR: [
//             { nombre: { contains: queryLower } },
//             { descripcion: { contains: queryLower } },
//           ],
//           estado: { not: 0 },
//         },
//       })

//       resultados.push(
//         ...medicamentos.map((medicamento) => ({
//           tipo: 'medicamento' as const,
//           id: medicamento.id,
//           titulo: medicamento.nombre,
//           subtitulo: medicamento.descripcion || undefined,
//           estado: medicamento.estado,
//           ruta: `/admin/medicamentos/${medicamento.id}`,
//           metadata: {
//             stock: medicamento.stock,
//             precio: medicamento.precio.toString(),
//           },
//         }))
//       )
//     }

//     if (categoria === 'todo' || categoria === 'reservas' || !categoria) {
//       const reservas = await prisma.reservaMedica.findMany({
//         where: {
//           OR: [
//             { detalles: { contains: queryLower } },
//             { usuario: { name: { contains: queryLower } } },
//           ],
//           estado: { not: 0 },
//         },
//         include: {
//           usuario: {
//             select: {
//               name: true,
//             },
//           },
//         },
//       })

//       resultados.push(
//         ...reservas.map((reserva) => ({
//           tipo: 'reserva' as const,
//           id: reserva.id,
//           titulo: reserva.usuario.name,
//           subtitulo: reserva.detalles,
//           estado: reserva.estado,
//           ruta: `/admin/reservas/${reserva.id}`,
//           metadata: {
//             fecha: reserva.fechaReserva.toISOString(),
//           },
//         }))
//       )
//     }

//     if (categoria === 'todo' || categoria === 'tratamientos' || !categoria) {
//       const tratamientos = await prisma.tratamiento.findMany({
//         where: {
//           OR: [
//             { descripcion: { contains: queryLower } },
//             { diagnostico: { contains: queryLower } },
//           ],
//           estado: { not: 0 },
//         },
//         include: {
//           historialMascota: {
//             include: {
//               mascota: {
//                 select: {
//                   nombre: true,
//                 },
//               },
//             },
//           },
//         },
//       })

//       resultados.push(
//         ...tratamientos.map((tratamiento) => ({
//           tipo: 'tratamiento' as const,
//           id: tratamiento.id,
//           titulo: tratamiento.descripcion,
//           subtitulo: tratamiento.historialMascota.mascota.nombre,
//           estado: tratamiento.estado,
//           ruta: `/admin/tratamientos/${tratamiento.id}`,
//           metadata: {
//             diagnostico: tratamiento.diagnostico,
//           },
//         }))
//       )
//     }

//     if (categoria === 'todo' || categoria === 'pagos' || !categoria) {
//       const pagos = await prisma.pago.findMany({
//         where: {
//           OR: [
//             { detalle: { contains: queryLower } },
//             { tratamiento: { descripcion: { contains: queryLower } } },
//           ],
//           estado: { not: 0 },
//         },
//         include: {
//           tratamiento: {
//             select: {
//               descripcion: true,
//             },
//           },
//         },
//       })

//       resultados.push(
//         ...pagos.map((pago) => ({
//           tipo: 'pago' as const,
//           id: pago.id,
//           titulo: `Pago #${pago.id}`,
//           subtitulo: pago.tratamiento.descripcion,
//           estado: pago.estado,
//           ruta: `/admin/pagos/${pago.id}`,
//           metadata: {
//             total: pago.total.toString(),
//             metodoPago: pago.metodoPago,
//           },
//         }))
//       )
//     }

//     revalidatePath('/')
//     return resultados
//   } catch (error) {
//     console.error('Error al buscar:', error)
//     return []
//   }
// }
