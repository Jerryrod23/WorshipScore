import Link from "next/link";
import { seleccionarPlan } from "@/app/actions/billing.actions";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{
    mensaje?: string;
  }>;
};

function mensajeTexto(mensaje?: string) {
  switch (mensaje) {
    case "success":
      return "El pago fue enviado correctamente. Tu suscripción se activará al confirmarse el pago.";
    case "cancelled":
      return "La selección del plan fue cancelada.";
    case "not-configured":
      return "Este plan todavía no está configurado para pagos.";
    case "checkout-error":
      return "No fue posible iniciar el pago. Intenta nuevamente.";
    case "unauthorized":
      return "Necesitas una cuenta activa para seleccionar un plan.";
    case "invalid":
      return "El plan seleccionado no está disponible.";
    default:
      return undefined;
  }
}

export default async function PlanesPage({ searchParams }: Props) {
  const { mensaje } = await searchParams;
  const planes = await prisma.plan.findMany({
    where: {
      activo: true,
    },
    orderBy: {
      precio: "asc",
    },
  });
  const mensajeVisible = mensajeTexto(mensaje);

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Elige tu plan
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Obtén un límite mensual o anual de descargas para tus partituras.
          </p>
        </div>

        {mensajeVisible && (
          <div className="mx-auto mb-8 max-w-2xl rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {mensajeVisible}
          </div>
        )}

        {planes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No hay planes disponibles
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Los planes estarán disponibles próximamente.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {planes.map((plan) => (
              <article
                key={plan.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{plan.nombre}</h2>
                  <p className="mt-3 text-4xl font-bold text-slate-900">
                    ${plan.precio.toString()}
                    <span className="ml-2 text-sm font-medium text-slate-500">
                      USD / {plan.intervalo === "MENSUAL" ? "mes" : "año"}
                    </span>
                  </p>
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    {plan.limiteDescargas} descargas incluidas
                  </p>
                  {plan.descripcion && (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {plan.descripcion}
                    </p>
                  )}
                </div>

                <form action={seleccionarPlan} className="mt-8">
                  <input type="hidden" name="planId" value={plan.id} />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Seleccionar plan
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          También puedes realizar pagos individuales de partituras.
          <Link href="/partituras" className="ml-1 font-semibold text-slate-900 hover:underline">
            Ver catálogo
          </Link>
        </p>
      </div>
    </main>
  );
}
