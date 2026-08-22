"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  esAdmin?: boolean;
  notificacionesNoLeidas?: number;
};

export default function Navbar({
  esAdmin = false,
  notificacionesNoLeidas = 0,
}: Props) {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [administrador, setAdministrador] = useState(esAdmin);
  const [notificaciones, setNotificaciones] = useState(
    notificacionesNoLeidas
  );
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    async function cargarUsuario() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUsuario(user?.email ?? null);
    }

    cargarUsuario();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user?.email ?? null);
      setAdministrador(session ? esAdmin : false);
      setNotificaciones(session ? notificacionesNoLeidas : 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [esAdmin, notificacionesNoLeidas]);

  async function cerrarSesion() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-lg text-white">
            ♪
          </div>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            WorshipScore
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Inicio
          </Link>

          <Link
            href="/partituras"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Partituras
          </Link>

          <Link
            href="/planes"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Planes
          </Link>

          <Link
            href="/solicitudes"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Solicitar partitura
          </Link>

          {administrador && (
            <Link
              href="/admin"
              className="text-sm font-semibold text-slate-900 transition hover:text-slate-600"
            >
              Panel admin
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="flex items-center gap-4">
          {usuario ? (
            <>
              {administrador && (
                <div className="hidden items-center gap-3 lg:flex">
                  <Link
                    href="/admin/solicitudes"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Solicitudes
                  </Link>

                  <Link
                    href="/admin/usuarios"
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Usuarios
                  </Link>
                </div>
              )}

              <Link
                href="/perfil"
                className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block"
              >
                {usuario}
              </Link>

              <Link
                href="/solicitudes"
                className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block"
              >
                Avisos{notificaciones > 0 ? ` (${notificaciones})` : ""}
              </Link>

              <button
                onClick={cerrarSesion}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Iniciar sesión
              </Link>

              <Link
                href="/registro"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}