"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { crearSolicitud } from "@/app/actions/solicitud.actions";

type Cancion = {
  id: string;
  titulo: string;
  compositor: string | null;
  descripcion: string | null;
};

type Props = {
  canciones: Cancion[];
};

export default function SolicitudForm({
  canciones,
}: Props) {
  const router = useRouter();
  const [crearCancion, setCrearCancion] = useState(
    canciones.length === 0
  );
  const [cancionId, setCancionId] = useState("");
  const [tonalidadSolicitada, setTonalidadSolicitada] =
    useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cancionSeleccionada = canciones.find(
    (cancion) => cancion.id === cancionId
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setCargando(true);

    try {
      const formData = new FormData(
        event.currentTarget
      );

      formData.set("cancionId", cancionId);
      formData.set("nuevaCancion", crearCancion ? "true" : "false");
      formData.set(
        "tonalidadSolicitada",
        tonalidadSolicitada
      );

      if (cancionSeleccionada) {
        formData.set(
          "titulo",
          cancionSeleccionada.titulo
        );

        formData.set(
          "compositor",
          cancionSeleccionada.compositor ?? ""
        );
      }

      const resultado =
        await crearSolicitud(formData);

      if (!resultado.success) {
        setError(resultado.message);
        return;
      }

      router.push("/solicitudes?success=created");
      router.refresh();

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

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Canción */}
      <div>
        <label
          htmlFor="cancionId"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Canción *
        </label>

        <label className="mb-3 flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={crearCancion}
            onChange={(event) => {
              setCrearCancion(event.target.checked);
              if (event.target.checked) {
                setCancionId("");
              }
            }}
          />
          Solicitar una canción nueva
        </label>

        {crearCancion ? (
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <input
              id="titulo"
              name="titulo"
              type="text"
              required
              placeholder="Título de la canción"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <input
              id="compositor"
              name="compositor"
              type="text"
              placeholder="Compositor (opcional)"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        ) : (
          <select
            id="cancionId"
            name="cancionId"
            required
            value={cancionId}
            onChange={(e) => setCancionId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Selecciona una canción</option>

            {canciones.map((cancion) => (
              <option key={cancion.id} value={cancion.id}>
                {cancion.titulo}
                {cancion.compositor ? ` — ${cancion.compositor}` : ""}
              </option>
            ))}
          </select>
        )}

        {canciones.length === 0 && (
          <p className="mt-2 text-sm text-red-600">
            Actualmente no hay canciones disponibles
            para solicitar.
          </p>
        )}
      </div>

      {/* Información de la canción */}
      {cancionSeleccionada && (
        <div className="rounded-lg bg-slate-50 p-4">

          <p className="text-sm font-semibold text-slate-900">
            {cancionSeleccionada.titulo}
          </p>

          {cancionSeleccionada.compositor && (
            <p className="mt-1 text-sm text-slate-500">
              {cancionSeleccionada.compositor}
            </p>
          )}

          {cancionSeleccionada.descripcion && (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {cancionSeleccionada.descripcion}
            </p>
          )}

        </div>
      )}

      {/* Tonalidad */}
      <div>
        <label
          htmlFor="tonalidadSolicitada"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Tonalidad que necesitas *
        </label>

        <select
          id="tonalidadSolicitada"
          name="tonalidadSolicitada"
          required
          value={tonalidadSolicitada}
          onChange={(e) =>
            setTonalidadSolicitada(e.target.value)
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="">
            Selecciona una tonalidad
          </option>

          <optgroup label="Mayores">
            <option value="Do Mayor">
              Do Mayor
            </option>

            <option value="Sol Mayor">
              Sol Mayor
            </option>

            <option value="Re Mayor">
              Re Mayor
            </option>

            <option value="La Mayor">
              La Mayor
            </option>

            <option value="Mi Mayor">
              Mi Mayor
            </option>

            <option value="Si Mayor">
              Si Mayor
            </option>

            <option value="Fa# Mayor">
              Fa# Mayor
            </option>

            <option value="Do# Mayor">
              Do# Mayor
            </option>

            <option value="Fa Mayor">
              Fa Mayor
            </option>

            <option value="Sib Mayor">
              Sib Mayor
            </option>

            <option value="Mib Mayor">
              Mib Mayor
            </option>

            <option value="Lab Mayor">
              Lab Mayor
            </option>

            <option value="Reb Mayor">
              Reb Mayor
            </option>

            <option value="Solb Mayor">
              Solb Mayor
            </option>
          </optgroup>

          <optgroup label="Menores">
            <option value="La menor">
              La menor
            </option>

            <option value="Mi menor">
              Mi menor
            </option>

            <option value="Si menor">
              Si menor
            </option>

            <option value="Fa# menor">
              Fa# menor
            </option>

            <option value="Do# menor">
              Do# menor
            </option>

            <option value="Sol# menor">
              Sol# menor
            </option>

            <option value="Re# menor">
              Re# menor
            </option>

            <option value="Sib menor">
              Sib menor
            </option>

            <option value="Fa menor">
              Fa menor
            </option>

            <option value="Do menor">
              Do menor
            </option>

            <option value="Sol menor">
              Sol menor
            </option>

            <option value="Re menor">
              Re menor
            </option>

            <option value="Lab menor">
              Lab menor
            </option>

            <option value="Mib menor">
              Mib menor
            </option>

            <option value="Sib menor">
              Sib menor
            </option>
          </optgroup>
        </select>
      </div>

      {/* Instrumento */}
      <div>
        <label
          htmlFor="instrumento"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Instrumento *
        </label>

        <input
          id="instrumento"
          name="instrumento"
          type="text"
          required
          placeholder="Ej. Piano"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Descripción */}
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
          placeholder="Describe alguna versión o arreglo específico que necesitas..."
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Comentarios */}
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

      {/* Botones */}
      <div className="flex gap-3">

        <button
          type="submit"
          disabled={
            cargando ||
            false
          }
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cargando
            ? "Enviando..."
            : "Enviar solicitud"}
        </button>

        <Link
          href="/partituras"
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </Link>

      </div>

    </form>
  );
}

