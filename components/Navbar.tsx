"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [usuario, setUsuario] = useState<string | null>(null);

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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function cerrarSesion() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/";
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
            href="/solicitudes"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Solicitar partitura
          </Link>
        </nav>

        {/* User section */}
        <div className="flex items-center gap-4">
          {usuario ? (
            <>
              <Link
                href="/perfil"
                className="hidden text-sm text-slate-600 hover:text-slate-900 sm:block"
              >
                {usuario}
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