import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">
              🎼 Tu biblioteca musical
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Encuentra la partitura que estás buscando.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Descubre, consulta y descarga partituras musicales.
              ¿No encuentras la que necesitas? Solicítala y nosotros
              nos encargaremos de crearla.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/partituras"
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explorar partituras
              </Link>

              <Link
                href="/solicitudes/nueva"
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Solicitar una partitura
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900">
              Todo lo que necesitas
            </h2>

            <p className="mt-2 text-slate-600">
              Una plataforma pensada para músicos, estudiantes y
              amantes de la música.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                🎼
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Biblioteca de partituras
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explora nuestro catálogo de partituras disponibles
                y encuentra la música que necesitas.
              </p>

              <Link
                href="/partituras"
                className="mt-5 inline-block text-sm font-semibold text-slate-900 hover:underline"
              >
                Ver partituras →
              </Link>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                🔍
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Busca lo que necesitas
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Busca por título, compositor, instrumento, género
                musical y otras características.
              </p>

              <Link
                href="/partituras"
                className="mt-5 inline-block text-sm font-semibold text-slate-900 hover:underline"
              >
                Buscar partituras →
              </Link>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
                ✨
              </div>

              <h3 className="text-lg font-semibold text-slate-900">
                Solicita una partitura
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Si no encuentras lo que buscas, puedes solicitar
                que creemos una partitura específica.
              </p>

              <Link
                href="/solicitudes/nueva"
                className="mt-5 inline-block text-sm font-semibold text-slate-900 hover:underline"
              >
                Hacer una solicitud →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 px-8 py-12 text-white sm:px-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">
                ¿No encuentras la partitura que necesitas?
              </h2>

              <p className="mt-4 text-slate-300">
                Envíanos los detalles de la obra y podrás hacer una
                solicitud para que sea creada.
              </p>

              <Link
                href="/solicitudes/nueva"
                className="mt-7 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Solicitar una partitura
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}