import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AlertaTemporal from "@/components/admin/AlertaTemporal";

export default async function AdminPartiturasPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
  }>;
}) {
  const params = await searchParams;

  const mensaje = params.success;

  const partituras = await prisma.partitura.findMany({
    include: {
      cancion: true,
    },
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return (
    <div className="container mx-auto p-6">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            Gestión de Partituras
          </h1>

          <p className="text-muted-foreground">
            Total: {partituras.length}
          </p>
        </div>

        <Link
          href="/admin/partituras/nueva"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Nueva Partitura
        </Link>

      </div>

      {mensaje === "updated" && (
        <AlertaTemporal
          mensaje="✅ Partitura actualizada correctamente"
        />
      )}

      {mensaje === "created" && (
        <AlertaTemporal
          mensaje="✅ Partitura creada correctamente"
        />
      )}

      <div className="overflow-hidden rounded-lg border">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">
                Canción
              </th>

              <th className="p-3 text-left">
                Compositor
              </th>

              <th className="p-3 text-left">
                Instrumento
              </th>

              <th className="p-3 text-left">
                Tonalidad
              </th>

              <th className="p-3 text-left">
                Nivel
              </th>

              <th className="p-3 text-left">
                Estado
              </th>

              <th className="p-3 text-right">
                Acciones
              </th>
            </tr>

          </thead>

          <tbody>

            {partituras.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-gray-500"
                >
                  No hay partituras registradas.
                </td>
              </tr>
            ) : (
              partituras.map((partitura) => (

                <tr
                  key={partitura.id}
                  className="border-t"
                >

                  <td className="p-3 font-medium">
                    {partitura.cancion.titulo}
                  </td>

                  <td className="p-3">
                    {partitura.cancion.compositor || "-"}
                  </td>

                  <td className="p-3">
                    {partitura.instrumento}
                  </td>

                  <td className="p-3 font-medium">
                    {partitura.tonalidad}
                  </td>

                  <td className="p-3">
                    {partitura.nivel}
                  </td>

                  <td className="p-3">
                    {partitura.publicada
                      ? "Publicada"
                      : "Oculta"}
                  </td>

                  <td className="p-3">

                    <div className="flex justify-end gap-2">

                      <Link
                        href={`/partituras/${partitura.id}`}
                        className="rounded border px-3 py-1 hover:bg-gray-100"
                      >
                        Ver
                      </Link>

                      <Link
                        href={`/admin/partituras/${partitura.id}/editar`}
                        className="rounded border px-3 py-1 hover:bg-gray-100"
                      >
                        Editar
                      </Link>

                      <button
                        type="button"
                        className="rounded border px-3 py-1 text-red-600 hover:bg-red-50"
                      >
                        Eliminar
                      </button>

                    </div>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}