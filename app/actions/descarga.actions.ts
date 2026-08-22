"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function descargarPartitura(partituraId: string) {
  const supabase = await createClient();

  // 1. Verificar sesión
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "Debes iniciar sesión para descargar la partitura.",
    };
  }

  // 2. Buscar usuario de ScoreHub
  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
  });

  if (!usuario) {
    return {
      success: false,
      message: "No se encontró el usuario de ScoreHub.",
    };
  }

  // 3. Verificar que el usuario esté activo
  if (usuario.estado !== "ACTIVO") {
    return {
      success: false,
      message: "Tu usuario está inactivo.",
    };
  }

  // 4. Buscar partitura
  const partitura = await prisma.partitura.findUnique({
    where: {
      id: partituraId,
    },
  });

  if (!partitura || !partitura.publicada) {
    return {
      success: false,
      message: "La partitura no está disponible.",
    };
  }

  // 5. Verificar que exista PDF
  if (!partitura.archivoPdf) {
    return {
      success: false,
      message: "El archivo PDF todavía no está disponible.",
    };
  }

  const ahora = new Date();
  const suscripcion = await prisma.suscripcion.findFirst({
    where: {
      usuarioId: usuario.id,
      estado: "ACTIVA",
      fechaInicio: { lte: ahora },
      fechaFin: { gt: ahora },
    },
    include: { plan: true },
    orderBy: { fechaFin: "desc" },
  });

  if (suscripcion) {
    const actualizado = await prisma.suscripcion.updateMany({
      where: {
        id: suscripcion.id,
        descargasUsadas: { lt: suscripcion.plan.limiteDescargas },
      },
      data: { descargasUsadas: { increment: 1 } },
    });

    if (actualizado.count === 0) {
      return {
        success: false,
        message: `Has alcanzado el límite de ${suscripcion.plan.limiteDescargas} descargas de tu plan.`,
      };
    }
  } else {
    const pago = await prisma.pago.findFirst({
      where: {
        usuarioId: usuario.id,
        partituraId: partitura.id,
        tipo: "DESCARGA_INDIVIDUAL",
        estado: "APROBADO",
      },
    });

    if (!pago) {
      return {
        success: false,
        message: `Esta descarga requiere un pago individual de $${partitura.precioIndividual.toString()} USD.`,
        requiresPayment: true,
      };
    }
  }

  // 6. Crear la descarga solo después de autorizar el acceso.
  await prisma.descarga.create({
    data: {
      usuarioId: usuario.id,
      partituraId: partitura.id,
    },
  });

  // 7. Crear URL firmada
  const { data, error } = await supabase.storage
    .from("partituras")
    .createSignedUrl(
      partitura.archivoPdf,
      60 * 5
    );

  if (error || !data?.signedUrl) {
    console.error(
      "ERROR GENERANDO URL FIRMADA:",
      error
    );

    return {
      success: false,
      message: "No fue posible generar el enlace de descarga.",
    };
  }

  return {
    success: true,
    url: data.signedUrl,
  };
}