import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function estadoSuscripcionTexto(estado: string) {
  switch (estado) {
    case "ACTIVA":
      return "Activa";
    case "CANCELADA":
      return "Cancelada";
    case "VENCIDA":
      return "Vencida";
    case "PAGO_FALLIDO":
      return "Pago fallido";
    default:
      return estado;
  }
}

function estadoSuscripcionClase(estado: string) {
  return estado === "ACTIVA"
    ? "bg-green-100 text-green-800"
    : "bg-slate-100 text-slate-600";
}

function estadoPagoTexto(estado: string) {
  switch (estado) {
    case "APROBADO":
      return "Aprobado";
    case "PENDIENTE":
      return "Pendiente";
    case "RECHAZADO":
      return "Rechazado";
    case "REEMBOLSADO":
      return "Reembolsado";
    default:
      return estado;
  }
}

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/perfil");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
    include: {
      suscripciones: {
        where: {
          estado: "ACTIVA",
          fechaFin: {
            gt: new Date(),
          },
        },
        include: {
          plan: true,
        },
        orderBy: {
          fechaFin: "desc",
        },
        take: 1,
      },
      pagos: {
        include: {
          partitura: {
            include: {
              cancion: true,
            },
          },
          suscripcion: {
            include: {
              plan: true,
            },
          },
        },
        orderBy: {
          fechaCreacion: "desc",
        },
        take: 8,
      },
      descargas: {
        include: {
          partitura: {
            include: {
              cancion: true,
            },
          },
        },
        orderBy: {
          fecha: "desc",
        },
        take: 8,
      },
    },
  });

  if (!usuario) {
    redirect("/login");
  }

  const suscripcion = usuario.suscripciones[0];
  const porcentaje = suscripcion
    ? Math.min(
        100,
        Math.round(
          (suscripcion.descargasUsadas / suscripcion.plan.limiteDescargas) * 100
        )
      )
    : 0;

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mi perfil
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Consulta tu cuenta, plan y actividad reciente.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/planes"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ver planes
            </Link>
            <Link
              href="/solicitudes"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Mis solicitudes
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Datos de cuenta</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="font-medium text-slate-500">Nombre</dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">{usuario.nombre}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Correo electrónico</dt>
                <dd className="mt-1 break-all text-slate-700">{usuario.email}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Tipo de cuenta</dt>
                <dd className="mt-1 text-slate-700">
                  {usuario.rol === "ADMIN" ? "Administrador" : "Usuario"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Estado</dt>
                <dd className="mt-1">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${usuario.estado === "ACTIVO" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {usuario.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Miembro desde</dt>
                <dd className="mt-1 text-slate-700">{usuario.fechaRegistro.toLocaleDateString("es-DO")}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Plan actual</h2>
                <p className="mt-1 text-sm text-slate-500">Tu acceso a descargas.</p>
              </div>
              {suscripcion && (
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${estadoSuscripcionClase(suscripcion.estado)}`}>
                  {estadoSuscripcionTexto(suscripcion.estado)}
                </span>
              )}
            </div>

            {suscripcion ? (
              <div className="mt-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{suscripcion.plan.nombre}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Válido hasta {suscripcion.fechaFin.toLocaleDateString("es-DO")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    {suscripcion.descargasUsadas} / {suscripcion.plan.limiteDescargas}
                  </p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${porcentaje}%` }} />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Has utilizado {suscripcion.descargasUsadas} descargas de tu límite.
                </p>
              </div>
            ) : (
              <div className="mt-6 rounded-lg bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">No tienes un plan activo</p>
                <p className="mt-1 text-sm text-slate-500">
                  Puedes pagar $1.99 USD por cada partitura que descargues o elegir un plan.
                </p>
                <Link href="/planes" className="mt-4 inline-block text-sm font-semibold text-slate-900 hover:underline">
                  Explorar planes →
                </Link>
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Últimas descargas</h2>
            <div className="mt-5 divide-y divide-slate-100">
              {usuario.descargas.length === 0 ? (
                <p className="py-4 text-sm text-slate-500">Todavía no has descargado partituras.</p>
              ) : (
                usuario.descargas.map((descarga) => (
                  <div key={descarga.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{descarga.partitura.cancion.titulo}</p>
                      <p className="mt-1 text-xs text-slate-500">{descarga.partitura.tonalidad} · {descarga.partitura.instrumento}</p>
                    </div>
                    <p className="shrink-0 text-xs text-slate-400">{descarga.fecha.toLocaleDateString("es-DO")}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Historial de pagos</h2>
            <div className="mt-5 divide-y divide-slate-100">
              {usuario.pagos.length === 0 ? (
                <p className="py-4 text-sm text-slate-500">Todavía no hay pagos registrados.</p>
              ) : (
                usuario.pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {pago.tipo === "SUSCRIPCION" ? pago.suscripcion?.plan.nombre ?? "Suscripción" : `Partitura ${pago.partitura?.cancion.titulo ?? ""}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {estadoPagoTexto(pago.estado)} · {pago.fechaCreacion.toLocaleDateString("es-DO")}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">${pago.monto.toString()} {pago.moneda}</p>
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
