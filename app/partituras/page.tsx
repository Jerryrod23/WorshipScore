import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PartiturasPage() {
  const partituras = await prisma.partitura.findMany({
    where: {
      publicada: true,
    },
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Partituras
          </h1>

          <p className="mt-2 max-w-2xl text-slate-600">
            Explora nuestra colección de partituras musicales.
            Encuentra obras para diferentes instrumentos y niveles.
          </p>
        </div>
      </section>

      {/* Catalog */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {partituras.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="text-4xl">🎼</div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No hay partituras disponibles
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Actualmente no tenemos partituras publicadas.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {partituras.length}{" "}
                  {partituras.length === 1
                    ? "partitura disponible"
                    : "partituras disponibles"}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {partituras.map((partitura) => (
                  <article
                    key={partitura.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Cover */}
                    <div className="flex h-48 items-center justify-center bg-slate-100">
                      {partitura.portadaUrl ? (
                        <img
                          src={partitura.portadaUrl}
                          alt={`Portada de ${partitura.titulo}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl text-slate-300">
                          🎼
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">
                            {partitura.titulo}
                          </h2>

                          {partitura.compositor && (
                            <p className="mt-1 text-sm text-slate-500">
                              {partitura.compositor}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {partitura.nivel}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                          🎹 {partitura.instrumento}
                        </span>

                        <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                          🎵 {partitura.genero}
                        </span>
                      </div>

                      {partitura.descripcion && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                          {partitura.descripcion}
                        </p>
                      )}

                      <Link
                        href={`/partituras/${partitura.id}`}
                        className="mt-5 block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                      >
                        Ver partitura
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}