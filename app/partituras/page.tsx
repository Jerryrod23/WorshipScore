import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PartiturasPage() {
  const canciones = await prisma.cancion.findMany({
    where: {
      partituras: {
        some: {
          publicada: true,
        },
      },
    },
    include: {
      partituras: {
        where: {
          publicada: true,
        },
        orderBy: {
          fechaCreacion: "desc",
        },
      },
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
            Encuentra obras para diferentes instrumentos y tonalidades.
          </p>

        </div>
      </section>

      {/* Catalog */}
      <section className="py-10">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {canciones.length === 0 ? (

            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

              <div className="text-4xl">
                🎼
              </div>

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
                  {canciones.length}{" "}
                  {canciones.length === 1
                    ? "canción disponible"
                    : "canciones disponibles"}
                </p>

              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {canciones.map((cancion) => {

                  const primeraPartitura =
                    cancion.partituras[0];

                  return (
                    <article
                      key={cancion.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                      {/* Cover */}
                      <div className="flex h-48 items-center justify-center bg-slate-100">

                        {primeraPartitura?.portadaUrl ? (

                          <img
                            src={primeraPartitura.portadaUrl}
                            alt={`Portada de ${cancion.titulo}`}
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
                              {cancion.titulo}
                            </h2>

                            {cancion.compositor && (
                              <p className="mt-1 text-sm text-slate-500">
                                {cancion.compositor}
                              </p>
                            )}

                          </div>

                          {primeraPartitura && (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              {primeraPartitura.nivel}
                            </span>
                          )}

                        </div>

                        {/* Instrumentos */}
                        <div className="mt-4 flex flex-wrap gap-2">

                          {Array.from(
                            new Set(
                              cancion.partituras.map(
                                (partitura) =>
                                  partitura.instrumento
                              )
                            )
                          ).map((instrumento) => (

                            <span
                              key={instrumento}
                              className="rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                            >
                              🎹 {instrumento}
                            </span>

                          ))}

                          <span className="rounded-md bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                            🎵 {cancion.genero}
                          </span>

                        </div>

                        {/* Tonalidades */}
                        <div className="mt-4">

                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Tonalidades disponibles
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">

                            {cancion.partituras.map(
                              (partitura) => (

                                <span
                                  key={partitura.id}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                                >
                                  {partitura.tonalidad}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                        {/* Description */}
                        {cancion.descripcion && (

                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                            {cancion.descripcion}
                          </p>

                        )}

                        {/* Button */}
                        {primeraPartitura && (

                          <Link
                            href={`/partituras/${primeraPartitura.id}`}
                            className="mt-5 block w-full rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Ver partituras
                          </Link>

                        )}

                      </div>

                    </article>
                  );
                })}

              </div>

            </>

          )}

        </div>

      </section>

    </div>
  );
}

