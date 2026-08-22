import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Props = {
  searchParams: Promise<{
    mensaje?: string;
  }>;
};

function texto(formData: FormData, nombre: string) {
  return String(formData.get(nombre) ?? "").trim();
}

function mensajeTexto(mensaje?: string) {
  switch (mensaje) {
    case "created":
      return "El plan se creó correctamente.";
    case "updated":
      return "El plan se actualizó correctamente.";
    case "invalid":
      return "Revisa el precio y el límite de descargas.";
    default:
      return undefined;
  }
}

async function guardarPlan(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = texto(formData, "id");
  const nombre = texto(formData, "nombre");
  const descripcion = texto(formData, "descripcion");
  const precio = texto(formData, "precio");
  const intervalo = texto(formData, "intervalo");
  const limiteDescargas = texto(formData, "limiteDescargas");
  const activo = formData.get("activo") === "true";

  if (
    !nombre ||
    !/^\d+(\.\d{1,2})?$/.test(precio) ||
    !["MENSUAL", "ANUAL"].includes(intervalo) ||
    !/^\d+$/.test(limiteDescargas) ||
    Number(limiteDescargas) < 1
  ) {
    redirect("/admin/planes?mensaje=invalid");
  }

  const data = {
    nombre,
    descripcion: descripcion || null,
    precio,
    moneda: "USD",
    intervalo: intervalo as "MENSUAL" | "ANUAL",
    limiteDescargas: Number(limiteDescargas),
    activo,
  };

  if (id) {
    await prisma.plan.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/planes");
    redirect("/admin/planes?mensaje=updated");
  }

  await prisma.plan.create({ data });
  revalidatePath("/admin/planes");
  redirect("/admin/planes?mensaje=created");
}

async function cambiarEstadoPlan(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = texto(formData, "id");
  const activo = formData.get("activo") === "true";

  if (!id) {
    redirect("/admin/planes?mensaje=invalid");
  }

  await prisma.plan.update({
    where: { id },
    data: { activo },
  });

  revalidatePath("/admin/planes");
  redirect("/admin/planes?mensaje=updated");
}

export default async function AdminPlanesPage({ searchParams }: Props) {
  const { mensaje } = await searchParams;
  const planes = await prisma.plan.findMany({
    orderBy: [
      { activo: "desc" },
      { intervalo: "asc" },
    ],
  });

  const mensajeVisible = mensajeTexto(mensaje);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Panel administrativo
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            Gestión de planes
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Configura precios y límites de descarga en dólares estadounidenses.
          </p>
        </div>

        {mensajeVisible && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {mensajeVisible}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Nuevo plan
            </h2>
            <form action={guardarPlan} className="mt-5 space-y-4">
              <div>
                <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre
                </label>
                <input id="nombre" name="nombre" required placeholder="Plan mensual" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label htmlFor="descripcion" className="mb-2 block text-sm font-medium text-slate-700">
                  Descripción
                </label>
                <textarea id="descripcion" name="descripcion" rows={3} placeholder="Beneficios del plan" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="precio" className="mb-2 block text-sm font-medium text-slate-700">
                    Precio (USD)
                  </label>
                  <input id="precio" name="precio" type="number" min="0" step="0.01" required placeholder="8.99" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                </div>
                <div>
                  <label htmlFor="limiteDescargas" className="mb-2 block text-sm font-medium text-slate-700">
                    Descargas incluidas
                  </label>
                  <input id="limiteDescargas" name="limiteDescargas" type="number" min="1" step="1" required placeholder="Ej. 20" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="intervalo" className="mb-2 block text-sm font-medium text-slate-700">
                  Periodicidad
                </label>
                <select id="intervalo" name="intervalo" defaultValue="MENSUAL" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm">
                  <option value="MENSUAL">Mensual</option>
                  <option value="ANUAL">Anual</option>
                </select>
              </div>
              <input type="hidden" name="activo" value="true" />
              <button type="submit" className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                Crear plan
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Planes configurados</h2>
                <p className="mt-1 text-sm text-slate-500">{planes.length} plan{planes.length === 1 ? "" : "es"} registrado{planes.length === 1 ? "" : "s"}.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {planes.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">
                  Todavía no hay planes. Crea el mensual y el anual con los límites que decidas.
                </p>
              ) : (
                planes.map((plan) => (
                  <div key={plan.id} className="rounded-lg border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{plan.nombre}</h3>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${plan.activo ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                            {plan.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-slate-900">${plan.precio.toString()} <span className="text-sm font-medium text-slate-500">USD / {plan.intervalo === "MENSUAL" ? "mes" : "año"}</span></p>
                        <p className="mt-1 text-sm text-slate-600">{plan.limiteDescargas} descargas incluidas</p>
                        {plan.descripcion && <p className="mt-2 text-sm text-slate-500">{plan.descripcion}</p>}
                      </div>
                      <form action={cambiarEstadoPlan}>
                        <input type="hidden" name="id" value={plan.id} />
                        <input type="hidden" name="activo" value={plan.activo ? "false" : "true"} />
                        <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          {plan.activo ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </div>
                    <details className="mt-4 border-t border-slate-100 pt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-700">Editar plan</summary>
                      <form action={guardarPlan} className="mt-4 space-y-3">
                        <input type="hidden" name="id" value={plan.id} />
                        <input name="nombre" required defaultValue={plan.nombre} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                        <textarea name="descripcion" defaultValue={plan.descripcion ?? ""} rows={2} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm" />
                        <div className="grid gap-3 sm:grid-cols-3">
                          <input name="precio" type="number" min="0" step="0.01" required defaultValue={plan.precio.toString()} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                          <input name="limiteDescargas" type="number" min="1" step="1" required defaultValue={plan.limiteDescargas} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
                          <select name="intervalo" defaultValue={plan.intervalo} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
                            <option value="MENSUAL">Mensual</option>
                            <option value="ANUAL">Anual</option>
                          </select>
                        </div>
                        <input type="hidden" name="activo" value={plan.activo ? "true" : "false"} />
                        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Guardar cambios</button>
                      </form>
                    </details>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
