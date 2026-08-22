import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "WorshipScore",
  description: "Tu biblioteca de partituras musicales",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const usuario = user
    ? await prisma.usuario.findUnique({
        where: {
          authUserId: user.id,
        },
        select: {
          id: true,
          rol: true,
        },
      })
    : null;

  const notificacionesNoLeidas = usuario
    ? await prisma.notificacion.count({
        where: {
          usuarioId: usuario.id,
          leida: false,
        },
      })
    : 0;

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Navbar
          esAdmin={usuario?.rol === "ADMIN"}
          notificacionesNoLeidas={notificacionesNoLeidas}
        />

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}