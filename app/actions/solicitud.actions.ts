"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function crearSolicitud(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Debes iniciar sesión para enviar una solicitud.",
    };
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
  });

  if (!usuario) {
    return {
      success: false,
      message: "No se encontró tu usuario en ScoreHub.",
    };
  }

  if (usuario.estado !== "ACTIVO") {
    return {
      success: false,
      message: "Tu usuario está inactivo.",
    };
  }

  const titulo = String(formData.get("titulo") ?? "").trim();
  const compositor = String(formData.get("compositor") ?? "").trim();
  const instrumento = String(formData.get("instrumento") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const comentarios = String(formData.get("comentarios") ?? "").trim();

  if (!titulo) {
    return {
      success: false,
      message: "El título de la partitura es obligatorio.",
    };
  }

  try {
    await prisma.solicitudPartitura.create({
      data: {
        usuarioId: usuario.id,
        titulo,
        compositor: compositor || null,
        instrumento: instrumento || null,
        descripcion: descripcion || null,
        comentarios: comentarios || null,
        estado: "PENDIENTE",
      },
    });

    revalidatePath("/solicitudes");
    revalidatePath("/admin/solicitudes");

    return {
      success: true,
      message: "Solicitud enviada correctamente.",
    };
  } catch (error) {
    console.error("ERROR CREANDO SOLICITUD:", error);

    return {
      success: false,
      message: "No fue posible crear la solicitud.",
    };
  }
}