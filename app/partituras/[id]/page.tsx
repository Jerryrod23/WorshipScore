 
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DownloadPdfButton from "@/components/partituras/DownloadPdfButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PartituraDetalle({
  params,
}: Props) {
  const { id } = await params;

  // --------------------------------------------------
  // Obtener la partitura seleccionada junto con canción
  // --------------------------------------------------

  const partituraActual =
    await prisma.partitura.findUnique({
      where: {
        id,
      },
      include: {
        cancion: {
          include: {
            partituras: {
              where: {
                publicada: true,
              },
              orderBy: {
                tonalidad: "asc",
              },
            },
          },
        },
      },
    });

  if (
    !partituraActual ||
    !partituraActual.publicada ||
    !partituraActual.cancion
  ) {
    notFound();
  }

  const cancion = partituraActual.cancion;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <Link
            href="/partituras"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Volver a partituras
          </Link>

        </div>
      </section>

      {/* Detail */}
      <section className="py-12">

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="grid md:grid-cols-2">

              {/* Cover */}
              <div className="flex min-h-[400px] items-center justify-center bg-slate-100">

                {partituraActual.portadaUrl ? (
                  <img
                    src={partituraActual.portadaUrl}
                    alt={`Portada de ${cancion.titulo}`}
                    className="h-full max-h-[500px] w-full object-cover"
                  />
                ) : (
                  <div className="text-8xl text-slate-300">
                    🎼
                  </div>
                )}

              </div>

              {/* Information */}
              <div className="p-8 sm:p-10">

                {/* Tags */}
                <div className="flex flex-wrap gap-2">

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {partituraActual.instrumento}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {cancion.genero || "-"}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {partituraActual.nivel}
                  </span>

                </div>

                {/* Title */}
                <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                  {cancion.titulo}
                </h1>

                {cancion.compositor && (
                  <p className="mt-2 text-lg text-slate-500">
                    {cancion.compositor}
                  </p>
                )}

                {/* Description */}
                {cancion.descripcion && (
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {cancion.descripcion}
                  </p>
                )}

                <div className="my-8 border-t border-slate-200" />

                {/* Details */}
                <dl className="space-y-4">

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Instrumento
                    </dt>

                    <dd className="mt-1 text-sm text-slate-700">
                      {partituraActual.instrumento}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Género
                    </dt>

                    <dd className="mt-1 text-sm text-slate-700">
                      {cancion.genero || "-"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Nivel
                    </dt>

                    <dd className="mt-1 text-sm text-slate-700">
                      {partituraActual.nivel}
                    </dd>
                  </div>

                </dl>

                {/* --------------------------------------- */}
                {/* TONALIDADES DISPONIBLES */}
                {/* --------------------------------------- */}

                <div className="my-8 border-t border-slate-200" />

                <div>

                  <h2 className="text-sm font-semibold text-slate-900">
                    Tonalidades disponibles
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Selecciona la tonalidad que deseas descargar.
                  </p>

                  <div className="mt-4 space-y-2">

                    {cancion.partituras.map(
                      (partitura) => {

                        const seleccionada =
                          partitura.id ===
                          partituraActual.id;

                        return (
                          <div
                            key={partitura.id}
                            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                              seleccionada
                                ? "border-slate-900 bg-slate-50"
                                : "border-slate-200"
                            }`}
                          >

                            <div>

                              <p className="font-medium text-slate-900">
                                {partitura.tonalidad}
                              </p>

                              <p className="text-xs text-slate-500">
                                {partitura.instrumento}
                              </p>

                            </div>

                            {seleccionada ? (
                              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                                Seleccionada
                              </span>
                            ) : (
                              <Link
                                href={`/partituras/${partitura.id}`}
                                className="rounded border px-3 py-1 text-sm hover:bg-slate-100"
                              >
                                Ver
                              </Link>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* --------------------------------------- */}
                {/* DOWNLOAD */}
                {/* --------------------------------------- */}

                <div className="mt-8">

                  {partituraActual.archivoPdf ? (
                    <DownloadPdfButton
                      partituraId={partituraActual.id}
                    />
                  ) : (
                    <div className="rounded-lg bg-slate-50 px-5 py-4 text-center text-sm text-slate-500">
                      El archivo PDF todavía no está disponible
                      para esta tonalidad.
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
 
