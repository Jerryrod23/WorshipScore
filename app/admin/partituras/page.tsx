import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AlertaTemporal from "@/components/admin/AlertaTemporal";
import { eliminarPartitura } from "@/app/actions/partitura.actions";

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

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Gestión de Partituras
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Administra las partituras disponibles en el catálogo.
          </p>
        </div>

        <Link
          href="/admin/partituras/nueva"
          className="rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          + Nueva partitura
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

      <div className="mb-8 grid gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total de partituras
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {partituras.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Publicadas
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {partituras.filter((partitura) => partitura.publicada).length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Ocultas
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-500">
            {partituras.filter((partitura) => !partitura.publicada).length}
          </p>
        </div>

      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {partituras.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              No hay partituras registradas
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Crea la primera partitura para comenzar el catálogo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Canción
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Compositor
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Instrumento
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tonalidad
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nivel
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                </tr>

              </thead>

              <tbody>

                {partituras.map((partitura) => (

                  <tr
                    key={partitura.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {partitura.cancion.titulo}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {partitura.cancion.compositor || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {partitura.instrumento}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {partitura.tonalidad}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {partitura.nivel}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          partitura.publicada
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {partitura.publicada ? "Publicada" : "Oculta"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">

                      <div className="flex justify-end gap-2">

                        <Link
                          href={`/partituras/${partitura.id}`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Ver
                        </Link>

                        <Link
                          href={`/admin/partituras/${partitura.id}/editar`}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Editar
                        </Link>

                        <form action={eliminarPartitura}>
                          <input
                            type="hidden"
                            name="id"
                            value={partitura.id}
                          />

                          <button
                            type="submit"
                            className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </form>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}