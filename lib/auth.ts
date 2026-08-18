import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No hay sesión
  if (!user) {
    redirect("/login");
  }

  // Buscar el usuario de ScoreHub
  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
  });

  // No existe en nuestra base de datos
  if (!usuario) {
    redirect("/");
  }

  // Usuario inactivo
  if (usuario.estado !== "ACTIVO") {
    redirect("/");
  }

  // No es administrador
  if (usuario.rol !== "ADMIN") {
    redirect("/");
  }

  return usuario;
}