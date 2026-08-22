"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function guardarPartitura(formData: FormData) {
  await requireAdmin();

  try {
    const id = formData.get("id") as string | null;

    const cancionId = formData.get("cancionId") as string;
    const instrumento = formData.get("instrumento") as string;
    const nivel = formData.get("nivel") as any;
    const tonalidad = formData.get("tonalidad") as string;
    const publicada = formData.get("publicada") === "true";

    // -----------------------------------------
    // Validaciones
    // -----------------------------------------

    if (!cancionId?.trim()) {
      throw new Error("Debe seleccionar una canción.");
    }

    if (!instrumento?.trim()) {
      throw new Error("El instrumento es obligatorio.");
    }

    if (!tonalidad?.trim()) {
      throw new Error("La tonalidad es obligatoria.");
    }

    // -----------------------------------------
    // Verificar que exista la canción
    // -----------------------------------------

    const cancion = await prisma.cancion.findUnique({
      where: {
        id: cancionId,
      },
    });

    if (!cancion) {
      throw new Error("La canción seleccionada no existe.");
    }

    // -----------------------------------------
    // ACTUALIZAR
    // -----------------------------------------

    if (id) {
      const partitura = await prisma.partitura.update({
        where: {
          id,
        },
        data: {
          cancionId,
          instrumento,
          nivel,
          tonalidad,
          publicada,
        },
      });

      revalidatePath("/admin");
      revalidatePath("/admin/partituras");
      revalidatePath(`/admin/partituras/${id}/editar`);
      revalidatePath(`/partituras/${id}`);

      return {
        success: true,
        id: partitura.id,
      };
    }

    // -----------------------------------------
    // Verificar duplicado
    // -----------------------------------------

    const duplicada = await prisma.partitura.findFirst({
      where: {
        cancionId,
        tonalidad,
      },
    });

    if (duplicada) {
      throw new Error(
        `Ya existe una partitura para "${cancion.titulo}" en tonalidad ${tonalidad}.`
      );
    }

    // -----------------------------------------
    // CREAR
    // -----------------------------------------

    const partitura = await prisma.partitura.create({
      data: {
        cancionId,
        instrumento,
        nivel,
        tonalidad,
        publicada,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/partituras");

    return {
      success: true,
      id: partitura.id,
    };

  } catch (error) {
    console.error(
      "ERROR EN GUARDAR PARTITURA:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error inesperado",
    };
  }
}

export async function guardarArchivoPdf(
  id: string,
  archivoPdf: string
) {
  await requireAdmin();

  if (!id) {
    throw new Error("ID de partitura no válido");
  }

  if (!archivoPdf) {
    throw new Error("La ruta del PDF es obligatoria");
  }

  await prisma.partitura.update({
    where: {
      id,
    },
    data: {
      archivoPdf,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/partituras");
  revalidatePath(`/partituras/${id}`);

  return {
    success: true,
  };
}