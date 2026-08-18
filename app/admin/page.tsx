import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {

  const totalPartituras = await prisma.partitura.count();

  const totalUsuarios = await prisma.usuario.count();

  const ultimasPartituras =
  await prisma.partitura.findMany({
    take: 5,
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return (
    <div className="container mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Panel Administrativo
      </h1>

      <div className="grid gap-4 md:grid-cols-4">

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Partituras
          </p>

          <h2 className="text-3xl font-bold">
            {totalPartituras}
          </h2>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Usuarios
          </p>

          <h2 className="text-3xl font-bold">
            {totalUsuarios}
          </h2>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Solicitudes
          </p>

          <h2 className="text-3xl font-bold">
            0
          </h2>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">
            Descargas
          </p>

          <h2 className="text-3xl font-bold">
            0
          </h2>
        </div>

      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          Últimas Partituras
        </h2>

        <div className="rounded-lg border">
          {ultimasPartituras.map((partitura) => (
            <div
              key={partitura.id}
              className="border-b p-4"
            >
              <div className="font-medium">
                {partitura.titulo}
              </div>

              <div className="text-sm text-gray-500">
                {partitura.compositor}
              </div>
            </div>
          ))}
        </div>
      </div>


      <div className="mt-8"> 
        <Link href="/admin/partituras">  Gestionar Partituras </Link>
      </div>

    </div>
  );
}