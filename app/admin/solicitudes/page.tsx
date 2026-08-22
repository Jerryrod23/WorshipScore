import Link from "next/link";
import { prisma } from "@/lib/prisma";

function estadoTexto(estado: string) {
  switch (estado) {
    case "PENDIENTE":
      return "Pendiente";

    case "EN_PROCESO":
      return "En proceso";

    case "COMPLETADA":
      return "Completada";

    case "RECHAZADA":
      return "Rechazada";

    default:
      return estado;
  }
}

function estadoClase(estado: string) {
  switch (estado) {
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-800";

    case "EN_PROCESO":
      return "bg-blue-100 text-blue-800";

    case "COMPLETADA":
      return "bg-green-100 text-green-800";

    case "RECHAZADA":
      return "bg-red-100 text-red-800";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function AdminSolicitudesPage() {
  const solicitudes =
    await prisma.solicitudPartitura.findMany({
      include: {
        usuario: true,
        cancion: true,
        partitura: true,
      },
      orderBy: {
        fechaSolicitud: "desc",
      },
    });

  const pendientes = solicitudes.filter(
    (solicitud) =>
      solicitud.estado === "PENDIENTE"
  ).length;

  const enProceso = solicitudes.filter(
    (solicitud) =>
      solicitud.estado === "EN_PROCESO"
  ).length;

  const completadas = solicitudes.filter(
    (solicitud) =>
      solicitud.estado === "COMPLETADA"
  ).length;

  const rechazadas = solicitudes.filter(
    (solicitud) =>
      solicitud.estado === "RECHAZADA"
  ).length;

  return (
    <div className="container mx-auto p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Gestión de Solicitudes
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Administra las solicitudes de partituras
          realizadas por los usuarios.
        </p>
      </div>

      {/* Resumen */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pendientes
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendientes}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            En proceso
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {enProceso}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completadas
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completadas}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Rechazadas
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {rechazadas}
          </p>
        </div>

      </div>

      {/* Lista */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {solicitudes.length === 0 ? (
          <div className="p-12 text-center">

            <div className="text-5xl">
              🎼
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No hay solicitudes
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Actualmente no existen solicitudes de partituras.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Canción
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Usuario
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Instrumento
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tonalidad
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acción
                  </th>

                </tr>

              </thead>

              <tbody>

                {solicitudes.map((solicitud) => (

                  <tr
                    key={solicitud.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    {/* Canción */}
                    <td className="px-4 py-4">

                      <div>
                        <p className="font-semibold text-slate-900">
                          {solicitud.cancion.titulo}
                        </p>

                        {solicitud.cancion.compositor && (
                          <p className="mt-1 text-xs text-slate-500">
                            {solicitud.cancion.compositor}
                          </p>
                        )}
                      </div>

                    </td>

                    {/* Usuario */}
                    <td className="px-4 py-4">

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {solicitud.usuario.nombre}
                        </p>

                        <p className="text-xs text-slate-500">
                          {solicitud.usuario.email}
                        </p>
                      </div>

                    </td>

                    {/* Instrumento */}
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {solicitud.instrumento || "-"}
                    </td>

                    {/* Tonalidad */}
                    <td className="px-4 py-4">

                      {solicitud.tonalidadSolicitada ? (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {solicitud.tonalidadSolicitada}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">
                          -
                        </span>
                      )}

                    </td>

                    {/* Estado */}
                    <td className="px-4 py-4">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(
                          solicitud.estado
                        )}`}
                      >
                        {estadoTexto(
                          solicitud.estado
                        )}
                      </span>

                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-4 text-sm text-slate-500">

                      {solicitud.fechaSolicitud.toLocaleDateString(
                        "es-DO"
                      )}

                    </td>

                    {/* Acción */}
                    <td className="px-4 py-4 text-right">

                      <Link
                        href={`/admin/solicitudes/${solicitud.id}`}
                        className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Gestionar
                      </Link>

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