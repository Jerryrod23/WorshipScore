import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DownloadPdfButton from "@/components/partituras/DownloadPdfButton";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PartituraDetalle({ params }: Props) {
  const { id } = await params;

  const partitura = await prisma.partitura.findUnique({
    where: {
      id,
    },
  });

  if (!partitura || !partitura.publicada) {
    notFound();
  }

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
                {partitura.portadaUrl ? (
                  <img
                    src={partitura.portadaUrl}
                    alt={`Portada de ${partitura.titulo}`}
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

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {partitura.instrumento}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {partitura.genero}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {partitura.nivel}
                  </span>
                </div>

                <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
                  {partitura.titulo}
                </h1>

                {partitura.compositor && (
                  <p className="mt-2 text-lg text-slate-500">
                    {partitura.compositor}
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
                      {partitura.instrumento}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Género
                    </dt>

                    <dd className="mt-1 text-sm text-slate-700">
                      {partitura.genero}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Nivel
                    </dt>

                    <dd className="mt-1 text-sm text-slate-700">
                      {partitura.nivel}
                    </dd>
                  </div>

                  {partitura.tonalidad && (
                    <div>
                      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Tonalidad
                      </dt>

                      <dd className="mt-1 text-sm text-slate-700">
                        {partitura.tonalidad}
                      </dd>
                    </div>
                  )}

                </dl>

                {/* Description */}
                {partitura.descripcion && (
                  <>
                    <div className="my-8 border-t border-slate-200" />

                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">
                        Descripción
                      </h2>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {partitura.descripcion}
                      </p>
                    </div>
                  </>
                )}

                {/* Download */}
                <div className="mt-8">
                 {partitura.archivoPdf ? (
                    <DownloadPdfButton
                      partituraId={partitura.id}
                    />
                  ) : (
                    <div className="rounded-lg bg-slate-50 px-5 py-4 text-center text-sm text-slate-500">
                      El archivo PDF todavía no está disponible.
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