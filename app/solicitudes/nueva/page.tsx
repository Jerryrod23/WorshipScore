import Link from "next/link";
import SolicitudForm from "@/components/solicitudes/SolicitudForm";

export default function NuevaSolicitudPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

        <div className="mb-8">
          <Link
            href="/solicitudes"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Mis solicitudes
          </Link>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
            Solicitar una partitura
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            ¿No encuentras la partitura que necesitas?
            Envíanos una solicitud y la revisaremos.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <SolicitudForm />
        </div>

      </div>
    </main>
  );
}