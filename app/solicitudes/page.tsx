import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    success?: string;
    mensaje?: string;
  }>;
};

async function marcarNotificacionesLeidas() {
  "use server";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/solicitudes");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
    select: {
      id: true,
    },
  });

  if (!usuario) {
    redirect("/login");
  }

  await prisma.notificacion.updateMany({
    where: {
      usuarioId: usuario.id,
      leida: false,
    },
    data: {
      leida: true,
    },
  });

  revalidatePath("/solicitudes");
  revalidatePath("/");
  redirect("/solicitudes?mensaje=read");
}

function estadoTexto(estado: string) {
  switch (estado) {
    case "PENDIENTE":
      return "Pendiente";

    case "EN_PROCESO":
      return "En proceso";

    case "COMPLETADA":
      return "Completada";

    case "RECHAZADA":
      return "Rechazada";

    default:
      return estado;
  }
}

function estadoClase(estado: string) {
  switch (estado) {
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-800";

    case "EN_PROCESO":
      return "bg-blue-100 text-blue-800";

    case "COMPLETADA":
      return "bg-green-100 text-green-800";

    case "RECHAZADA":
      return "bg-red-100 text-red-800";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function SolicitudesPage({
  searchParams,
}: Props) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/solicitudes");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
  });

  if (!usuario) {
    redirect("/login");
  }

  const solicitudes =
    await prisma.solicitudPartitura.findMany({
      where: {
        usuarioId: usuario.id,
      },
      include: {
        partitura: true,
      },
      orderBy: {
        fechaSolicitud: "desc",
      },
    });

  const notificaciones = await prisma.notificacion.findMany({
    where: {
      usuarioId: usuario.id,
    },
    include: {
      solicitud: true,
    },
    orderBy: {
      fechaCreacion: "desc",
    },
    take: 10,
  });

  const notificacionesNoLeidas = notificaciones.filter(
    (notificacion) => !notificacion.leida
  ).length;

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Mis solicitudes
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Consulta el estado de las partituras que has solicitado.
            </p>
          </div>

          <Link
            href="/solicitudes/nueva"
            className="rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + Nueva solicitud
          </Link>

        </div>

        {/* Success */}
        {params.success === "created" && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-700">
              Tu solicitud fue enviada correctamente.
            </p>
          </div>
        )}

        {params.mensaje === "read" && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm text-blue-700">
              Las notificaciones fueron marcadas como leídas.
            </p>
          </div>
        )}

        {notificaciones.length > 0 && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Notificaciones
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {notificacionesNoLeidas === 0
                    ? "Estás al día."
                    : `${notificacionesNoLeidas} sin leer`}
                </p>
              </div>

              {notificacionesNoLeidas > 0 && (
                <form action={marcarNotificacionesLeidas}>
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Marcar como leídas
                  </button>
                </form>
              )}
            </div>

            <div className="mt-5 divide-y divide-slate-100">
              {notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between ${
                    !notificacion.leida ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {notificacion.titulo}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {notificacion.mensaje}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {notificacion.fechaCreacion.toLocaleDateString("es-DO")}
                    </p>
                  </div>

                  <Link
                    href={`/solicitudes#${notificacion.solicitudId}`}
                    className="text-sm font-semibold text-slate-900 hover:underline"
                  >
                    Ver solicitud →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty */}
        {solicitudes.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="text-6xl">
              🎼
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">
              Todavía no tienes solicitudes
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Si no encuentras una partitura, puedes
              solicitar que la agreguemos.
            </p>

            <Link
              href="/solicitudes/nueva"
              className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Solicitar una partitura
            </Link>

          </div>
        ) : (
          <div className="space-y-4">

            {solicitudes.map((solicitud) => (
              <div
                key={solicitud.id}
                id={solicitud.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {solicitud.titulo}
                    </h2>

                    {solicitud.compositor && (
                      <p className="mt-1 text-sm text-slate-500">
                        {solicitud.compositor}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">

                      {solicitud.instrumento && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          🎹 {solicitud.instrumento}
                        </span>
                      )}

                      {solicitud.tonalidadSolicitada && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          🎵 Tonalidad:{" "}
                          {solicitud.tonalidadSolicitada}
                        </span>
                      )}

                    </div>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(
                      solicitud.estado
                    )}`}
                  >
                    {estadoTexto(solicitud.estado)}
                  </span>

                </div>

                {solicitud.descripcion && (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {solicitud.descripcion}
                  </p>
                )}

                {solicitud.comentarios && (
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Comentarios
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {solicitud.comentarios}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-slate-400">
                    Solicitud realizada el{" "}
                    {solicitud.fechaSolicitud.toLocaleDateString(
                      "es-DO"
                    )}
                  </p>

                  {solicitud.estado === "COMPLETADA" &&
                    solicitud.partitura && (
                      <Link
                        href={`/partituras/${solicitud.partitura.id}`}
                        className="text-sm font-semibold text-slate-900 hover:underline"
                      >
                        Ver partitura →
                      </Link>
                    )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}
