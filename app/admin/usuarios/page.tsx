import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

 type Props = {
  searchParams: Promise<{
    q?: string;
    mensaje?: string;
  }>;
};

function estadoTexto(estado: string) {
  return estado === "ACTIVO" ? "Activo" : "Inactivo";
}

function estadoClase(estado: string) {
  return estado === "ACTIVO"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
}

function mensajeTexto(mensaje?: string) {
  switch (mensaje) {
    case "updated":
      return "El estado del usuario se actualizó correctamente.";
    case "self":
      return "No puedes desactivar tu propia cuenta de administrador.";
    case "invalid":
      return "El usuario indicado no es válido.";
    default:
      return undefined;
  }
}

async function cambiarEstadoUsuario(formData: FormData) {
  "use server";

  const administrador = await requireAdmin();
  const usuarioId = String(formData.get("usuarioId") ?? "").trim();
  const estado = String(formData.get("estado") ?? "").trim();

  if (!usuarioId || !["ACTIVO", "INACTIVO"].includes(estado)) {
    redirect("/admin/usuarios?mensaje=invalid");
  }

  if (usuarioId === administrador.id) {
    redirect("/admin/usuarios?mensaje=self");
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
  });

  if (!usuario) {
    redirect("/admin/usuarios?mensaje=invalid");
  }

  await prisma.usuario.update({
    where: {
      id: usuarioId,
    },
    data: {
      estado: estado as "ACTIVO" | "INACTIVO",
    },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin");
  redirect("/admin/usuarios?mensaje=updated");
}

export default async function AdminUsuariosPage({
  searchParams,
}: Props) {
  const { q, mensaje } = await searchParams;
  const busqueda = q?.trim() ?? "";

  const usuarios = await prisma.usuario.findMany({
    where: busqueda
      ? {
          OR: [
            {
              nombre: {
                contains: busqueda,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: busqueda,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    orderBy: {
      fechaRegistro: "desc",
    },
  });

  const activos = usuarios.filter(
    (usuario) => usuario.estado === "ACTIVO"
  ).length;
  const inactivos = usuarios.length - activos;
  const mensajeVisible = mensajeTexto(mensaje);

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Panel administrativo
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Gestión de usuarios
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Consulta y controla el acceso de los usuarios registrados.
            </p>
          </div>
        </div>

        {mensajeVisible && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {mensajeVisible}
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Usuarios encontrados</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {usuarios.length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Activos</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{activos}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Inactivos</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{inactivos}</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <form method="get" className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
            <label htmlFor="q" className="sr-only">
              Buscar usuario
            </label>
            <input
              id="q"
              name="q"
              defaultValue={busqueda}
              placeholder="Buscar por nombre o correo"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Buscar
            </button>
            {busqueda && (
              <Link
                href="/admin/usuarios"
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar
              </Link>
            )}
          </form>

          {usuarios.length === 0 ? (
            <p className="p-12 text-center text-sm text-slate-500">
              No se encontraron usuarios.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Registro
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => {
                    const nuevoEstado =
                      usuario.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
                    const esAdministrador = usuario.rol === "ADMIN";

                    return (
                      <tr
                        key={usuario.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-900">
                            {usuario.nombre}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {usuario.email}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                          {usuario.rol === "ADMIN" ? "Administrador" : "Usuario"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${estadoClase(
                              usuario.estado
                            )}`}
                          >
                            {estadoTexto(usuario.estado)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-500">
                          {usuario.fechaRegistro.toLocaleDateString("es-DO")}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {esAdministrador ? (
                            <span className="text-sm text-slate-400">
                              Cuenta protegida
                            </span>
                          ) : (
                            <form action={cambiarEstadoUsuario}>
                              <input
                                type="hidden"
                                name="usuarioId"
                                value={usuario.id}
                              />
                              <input
                                type="hidden"
                                name="estado"
                                value={nuevoEstado}
                              />
                              <button
                                type="submit"
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50 ${
                                  usuario.estado === "ACTIVO"
                                    ? "border-red-300 text-red-700"
                                    : "border-green-300 text-green-700"
                                }`}
                              >
                                {usuario.estado === "ACTIVO"
                                  ? "Desactivar"
                                  : "Activar"}
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
