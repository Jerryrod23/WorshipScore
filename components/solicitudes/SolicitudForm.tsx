"use client";

import { useState } from "react";
import { crearSolicitud } from "@/app/actions/solicitud.actions";

export default function SolicitudForm() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const formData = new FormData(event.currentTarget);

      const resultado = await crearSolicitud(formData);

      if (!resultado.success) {
        setError(resultado.message);
        return;
      }

      window.location.href = "/solicitudes?success=created";
    } catch (error) {
      console.error(error);

      setError(
        "No fue posible enviar la solicitud."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="titulo"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Título de la partitura *
        </label>

        <input
          id="titulo"
          name="titulo"
          type="text"
          required
          placeholder="Ej. Canon in D"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="compositor"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Compositor
        </label>

        <input
          id="compositor"
          name="compositor"
          type="text"
          placeholder="Ej. Johann Pachelbel"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="instrumento"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Instrumento
        </label>

        <input
          id="instrumento"
          name="instrumento"
          type="text"
          placeholder="Ej. Piano"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="descripcion"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Descripción de la solicitud
        </label>

        <textarea
          id="descripcion"
          name="descripcion"
          rows={5}
          placeholder="Describe la partitura, versión o arreglo que necesitas..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label
          htmlFor="comentarios"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Comentarios adicionales
        </label>

        <textarea
          id="comentarios"
          name="comentarios"
          rows={4}
          placeholder="Información adicional que pueda ayudarnos..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={cargando}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando
            ? "Enviando..."
            : "Enviar solicitud"}
        </button>

        <a
          href="/partituras"
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}