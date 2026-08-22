"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { NivelPartitura } from "@/prisma/generated/prisma/enums";

export async function guardarPartitura(formData: FormData) {
  await requireAdmin();

  try {
    const id = formData.get("id") as string | null;

    const cancionId = String(formData.get("cancionId") ?? "").trim();
    const nuevaCancion = formData.get("nuevaCancion") === "true";
    const tituloCancion = String(
      formData.get("tituloCancion") ?? ""
    ).trim();
    const compositorCancion = String(
      formData.get("compositorCancion") ?? ""
    ).trim();
    const generoCancion = String(
      formData.get("generoCancion") ?? ""
    ).trim();
    const instrumento = formData.get("instrumento") as string;
    const nivel = formData.get("nivel") as NivelPartitura;
    const tonalidad = formData.get("tonalidad") as string;
    const precioIndividual = String(
      formData.get("precioIndividual") ?? "1.99"
    ).trim();
    const publicada = formData.get("publicada") === "true";

    // -----------------------------------------
    // Validaciones
    // -----------------------------------------

    if (!cancionId && !nuevaCancion) {
      throw new Error("Debe seleccionar una canción.");
    }

    if (nuevaCancion && !tituloCancion) {
      throw new Error("El título de la canción es obligatorio.");
    }

    if (id && nuevaCancion) {
      throw new Error("No se puede crear una canción al editar una partitura.");
    }

    if (!instrumento?.trim()) {
      throw new Error("El instrumento es obligatorio.");
    }

    if (!tonalidad?.trim()) {
      throw new Error("La tonalidad es obligatoria.");
    }

    if (!/^\d+(\.\d{1,2})?$/.test(precioIndividual)) {
      throw new Error("El precio individual debe ser un monto válido.");
    }

    if (Number(precioIndividual) < 0) {
      throw new Error("El precio individual no puede ser negativo.");
    }

    // -----------------------------------------
    // Verificar que exista la canción
    // -----------------------------------------

    const cancion = cancionId
      ? await prisma.cancion.findUnique({
          where: {
            id: cancionId,
          },
        })
      : null;

    if (nuevaCancion) {
      const cancionExistente = await prisma.cancion.findFirst({
        where: {
          titulo: {
            equals: tituloCancion,
            mode: "insensitive",
          },
        },
      });

      if (cancionExistente) {
        throw new Error(
          `Ya existe una canción con el título "${cancionExistente.titulo}".`
        );
      }
    }

    if (cancionId && !cancion) {
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
          precioIndividual,
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

    if (cancion) {
      const duplicada = await prisma.partitura.findFirst({
        where: {
          cancionId: cancion.id,
          tonalidad,
        },
      });

      if (duplicada) {
        throw new Error(
          `Ya existe una partitura para "${cancion.titulo}" en tonalidad ${tonalidad}.`
        );
      }
    }

    // -----------------------------------------
    // CREAR
    // -----------------------------------------

    const resultado = await prisma.$transaction(async (tx) => {
      const cancionFinal = cancion ?? (await tx.cancion.create({
        data: {
          titulo: tituloCancion,
          compositor: compositorCancion || null,
          genero: generoCancion || null,
        },
      }));

      return tx.partitura.create({
        data: {
          cancionId: cancionFinal.id,
          instrumento,
          nivel,
          tonalidad,
          precioIndividual,
          publicada,
        },
      });
    });

    revalidatePath("/admin");
    revalidatePath("/admin/partituras");

    return {
      success: true,
      id: resultado.id,
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

export async function eliminarPartitura(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    throw new Error("ID de partitura no válido");
  }

  await prisma.partitura.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/partituras");
  revalidatePath("/partituras");
}