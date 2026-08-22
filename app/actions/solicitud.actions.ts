"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearSolicitud(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // -----------------------------------------
  // Validar sesión
  // -----------------------------------------

  if (!user) {
    return {
      success: false,
      message:
        "Debes iniciar sesión para enviar una solicitud.",
    };
  }

  // -----------------------------------------
  // Obtener usuario
  // -----------------------------------------

  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
  });

  if (!usuario) {
    return {
      success: false,
      message:
        "No se encontró tu usuario en ScoreHub.",
    };
  }

  if (usuario.estado !== "ACTIVO") {
    return {
      success: false,
      message: "Tu usuario está inactivo.",
    };
  }

  // -----------------------------------------
  // Obtener datos del formulario
  // -----------------------------------------

  const titulo = String(
    formData.get("titulo") ?? ""
  ).trim();

  const compositor = String(
    formData.get("compositor") ?? ""
  ).trim();

  const instrumento = String(
    formData.get("instrumento") ?? ""
  ).trim();

  const descripcion = String(
    formData.get("descripcion") ?? ""
  ).trim();

  const comentarios = String(
    formData.get("comentarios") ?? ""
  ).trim();

  const tonalidadSolicitada = String(
    formData.get("tonalidadSolicitada") ?? ""
  ).trim();

  const cancionId = String(
    formData.get("cancionId") ?? ""
  ).trim();

  const nuevaCancion = formData.get("nuevaCancion") === "true";

  // -----------------------------------------
  // Validaciones
  // -----------------------------------------

  if (!titulo && !nuevaCancion) {
    return {
      success: false,
      message:
        "El título de la partitura es obligatorio.",
    };
  }

  if (nuevaCancion && !titulo) {
    return {
      success: false,
      message:
        "El título de la nueva canción es obligatorio.",
    };
  }

  if (!nuevaCancion && !cancionId) {
    return {
      success: false,
      message:
        "Selecciona una canción o indica que es una canción nueva.",
    };
  }

  if (!instrumento) {
    return {
      success: false,
      message:
        "El instrumento es obligatorio.",
    };
  }

  if (!tonalidadSolicitada) {
    return {
      success: false,
      message:
        "La tonalidad solicitada es obligatoria.",
    };
  }

  // -----------------------------------------
  // Buscar canción
  // -----------------------------------------

  let cancion = null;

  if (cancionId && !nuevaCancion) {
    cancion = await prisma.cancion.findUnique({
      where: {
        id: cancionId,
      },
    });

    if (!cancion) {
      return {
        success: false,
        message:
          "La canción seleccionada no existe.",
      };
    }
  }

  if (nuevaCancion) {
    const cancionExistente = await prisma.cancion.findFirst({
      where: {
        titulo: {
          equals: titulo,
          mode: "insensitive",
        },
      },
    });

    if (cancionExistente) {
      return {
        success: false,
        message:
          `Ya existe una canción con el título "${cancionExistente.titulo}". Selecciónala como canción existente.`,
      };
    }

    cancion = await prisma.cancion.create({
      data: {
        titulo,
        compositor: compositor || null,
        descripcion: descripcion || null,
        genero: "Pendiente",
      },
    });
  }

  // -----------------------------------------
  // Si no seleccionó canción, buscar por título
  // -----------------------------------------

  if (!cancion && !nuevaCancion) {
    cancion = await prisma.cancion.findFirst({
      where: {
        titulo: {
          equals: titulo,
          mode: "insensitive",
        },
      },
    });

    // -----------------------------------------
    // Crear canción si todavía no existe
    // -----------------------------------------

    if (!cancion) {
      cancion = await prisma.cancion.create({
        data: {
          titulo,
          compositor: compositor || null,
          descripcion: descripcion || null,
          genero: "Pendiente",
        },
      });
    }
  }

  if (!cancion) {
    return {
      success: false,
      message: "No fue posible preparar la canción para la solicitud.",
    };
  }

  try {
    // -----------------------------------------
    // Verificar si ya existe una partitura
    // para esa canción y tonalidad
    // -----------------------------------------

    const partituraExistente =
      await prisma.partitura.findFirst({
        where: {
          cancionId: cancion.id,
          tonalidad: tonalidadSolicitada,
          publicada: true,
        },
      });

    if (partituraExistente) {
      return {
        success: false,
        message:
          `Ya existe una partitura de "${cancion.titulo}" en tonalidad ${tonalidadSolicitada}.`,
      };
    }

    // -----------------------------------------
    // Crear solicitud
    // -----------------------------------------

    await prisma.solicitudPartitura.create({
      data: {
        usuarioId: usuario.id,

        cancionId: cancion.id,

        titulo: cancion.titulo,

        compositor:
          compositor ||
          cancion.compositor ||
          null,

        instrumento:
          instrumento || null,

        descripcion:
          descripcion ||
          cancion.descripcion ||
          null,

        comentarios:
          comentarios || null,

        tonalidadSolicitada,

        estado: "PENDIENTE",
      },
    });

    // -----------------------------------------
    // Actualizar páginas
    // -----------------------------------------

    revalidatePath("/solicitudes");
    revalidatePath("/admin/solicitudes");

    // -----------------------------------------
    // Respuesta
    // -----------------------------------------

    return {
      success: true,
      message:
        "Solicitud enviada correctamente.",
    };
  } catch (error) {
    console.error(
      "ERROR CREANDO SOLICITUD:",
      error
    );

    return {
      success: false,
      message:
        "No fue posible crear la solicitud.",
    };
  }
}