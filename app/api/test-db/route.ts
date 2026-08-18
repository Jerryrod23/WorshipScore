import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.count();

    return NextResponse.json({
      status: "OK",
      database: "PostgreSQL",
      usuarios,
    });
  } catch (error) {
    console.error("Error de conexión:", error);

    return NextResponse.json(
      {
        status: "ERROR",
        message: "No fue posible conectar con la base de datos",
      },
      { status: 500 }
    );
  }
}