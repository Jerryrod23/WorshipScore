import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [totalPartituras, totalUsuarios, totalSolicitudes, totalDescargas, ultimasPartituras] =
    await Promise.all([
      prisma.partitura.count(),
      prisma.usuario.count(),
      prisma.solicitudPartitura.count(),
      prisma.descarga.count(),
      prisma.partitura.findMany({
        take: 5,
        include: {
          cancion: true,
        },
        orderBy: {
          fechaCreacion: "desc",
        },
      }),
    ]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Panel Administrativo
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Administra el catálogo, los usuarios y las solicitudes de partituras.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Partituras</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalPartituras}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Usuarios</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {totalUsuarios}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Solicitudes</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalSolicitudes}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Descargas</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {totalDescargas}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Últimas partituras
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Las incorporaciones más recientes al catálogo.
            </p>
          </div>

          <Link
            href="/admin/partituras"
            className="inline-flex w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ver catálogo
          </Link>
        </div>

        {ultimasPartituras.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No hay partituras registradas
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Crea la primera partitura para comenzar el catálogo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ultimasPartituras.map((partitura) => (
              <div
                key={partitura.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {partitura.cancion.titulo}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {partitura.cancion.compositor || "Compositor no indicado"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {partitura.instrumento}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {partitura.tonalidad}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        partitura.publicada
                          ? "bg-green-50 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {partitura.publicada ? "Publicada" : "Oculta"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/partituras/${partitura.id}/editar`}
                  className="inline-flex w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Editar
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/solicitudes"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <p className="font-semibold text-slate-900">Gestionar solicitudes</p>
          <p className="mt-1 text-sm text-slate-500">
            Revisa estados y asocia partituras.
          </p>
        </Link>

        <Link
          href="/admin/usuarios"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <p className="font-semibold text-slate-900">Gestionar usuarios</p>
          <p className="mt-1 text-sm text-slate-500">
            Consulta y controla el acceso de las cuentas.
          </p>
        </Link>
      </div>
    </div>
  );
}