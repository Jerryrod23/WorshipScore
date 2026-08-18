"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function guardarPartitura(formData: FormData) {
  await requireAdmin();

  let isUpdate = false;

  try {
    const id = formData.get("id") as string;
    isUpdate = Boolean(id);

    const titulo = formData.get("titulo") as string;
    const compositor = formData.get("compositor") as string;
    const descripcion = formData.get("descripcion") as string;
    const instrumento = formData.get("instrumento") as string;
    const genero = formData.get("genero") as string;
    const nivel = formData.get("nivel") as any;
    const tonalidad = formData.get("tonalidad") as string;
    const publicada = formData.get("publicada") === "true";

    if (!titulo?.trim()) {
      throw new Error("El título es obligatorio");
    }

    if (id) {
      await prisma.partitura.update({
        where: { id },
        data: {
          titulo,
          compositor: compositor || null,
          descripcion: descripcion || null,
          instrumento,
          genero,
          nivel,
          tonalidad: tonalidad || null,
          publicada,
        },
      });

      revalidatePath("/admin");
      revalidatePath("/admin/partituras");
      revalidatePath(`/admin/partituras/${id}`);
      revalidatePath(`/admin/partituras/${id}/editar`);

      redirect(`/admin/partituras?success=updated`);
    }

    const partitura = await prisma.partitura.create({
      data: {
        titulo,
        compositor: compositor || null,
        descripcion: descripcion || null,
        instrumento,
        genero,
        nivel,
        tonalidad: tonalidad || null,
        publicada,
      },
    });

    return {
      success: true,
      id: partitura.id,
    };
  } catch (error) {
    console.error("ERROR EN GUARDAR PARTITURA:", error);

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
  revalidatePath(`/admin/partituras/${id}`);
  revalidatePath(`/partituras/${id}`);

  return {
    success: true,
  };
}