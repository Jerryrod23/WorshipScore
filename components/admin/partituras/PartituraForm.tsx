"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  guardarPartitura,
  guardarArchivoPdf,
} from "@/app/actions/partitura.actions";
import { createClient } from "@/lib/supabase/client";

type NivelPartitura =
  | "PRINCIPIANTE"
  | "INTERMEDIO"
  | "AVANZADO";

type Cancion = {
  id: string;
  titulo: string;
  compositor: string | null;
  genero: string | null;
};

type PartituraFormProps = {
  canciones: Cancion[];

  initialData?: {
    id: string;
    cancionId: string;
    instrumento: string;
    nivel: NivelPartitura;
    tonalidad: string;
    precioIndividual: string;
    publicada: boolean;
    archivoPdf: string | null;
  };
};

export default function PartituraForm({
  canciones,
  initialData,
}: PartituraFormProps) {
  const router = useRouter();
  const [crearCancion, setCrearCancion] = useState(
    !initialData && canciones.length === 0
  );

  const [cancionId, setCancionId] = useState(
    initialData?.cancionId ?? ""
  );

  const [tituloCancion, setTituloCancion] = useState("");
  const [compositorCancion, setCompositorCancion] = useState("");
  const [generoCancion, setGeneroCancion] = useState("");

  const [instrumento, setInstrumento] = useState(
    initialData?.instrumento ?? ""
  );

  const [nivel, setNivel] = useState<NivelPartitura>(
    initialData?.nivel ?? "INTERMEDIO"
  );

  const [tonalidad, setTonalidad] = useState(
    initialData?.tonalidad ?? ""
  );

  const [precioIndividual, setPrecioIndividual] = useState(
    initialData?.precioIndividual ?? "1.99"
  );

  const [publicada, setPublicada] = useState(
    initialData?.publicada ?? true
  );

  const [archivoPdf, setArchivoPdf] =
    useState<File | null>(null);

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
      const formData = new FormData();

      if (initialData?.id) {
        formData.append("id", initialData.id);
      }

      formData.append("cancionId", cancionId);
      formData.append("nuevaCancion", crearCancion ? "true" : "false");
      formData.append("tituloCancion", tituloCancion);
      formData.append("compositorCancion", compositorCancion);
      formData.append("generoCancion", generoCancion);
      formData.append("instrumento", instrumento);
      formData.append("nivel", nivel);
      formData.append("tonalidad", tonalidad);
      formData.append("precioIndividual", precioIndividual);
      formData.append(
        "publicada",
        publicada ? "true" : "false"
      );

      const resultado = await guardarPartitura(formData);

      if (!resultado?.success) {
        throw new Error(
          resultado?.message ??
            "No fue posible guardar la partitura."
        );
      }

      const partituraId =
        initialData?.id ?? resultado.id;

      if (!partituraId) {
        throw new Error(
          "No se obtuvo el ID de la partitura."
        );
      }

      // -----------------------------------------
      // SUBIR PDF
      // -----------------------------------------

      if (archivoPdf) {
        if (archivoPdf.type !== "application/pdf") {
          throw new Error(
            "El archivo seleccionado debe ser un PDF."
          );
        }

        const maxSize = 20 * 1024 * 1024;

        if (archivoPdf.size > maxSize) {
          throw new Error(
            "El PDF no puede superar los 20 MB."
          );
        }

        const supabase = createClient();

        const ruta = `${partituraId}/partitura.pdf`;

        const { error: uploadError } =
          await supabase.storage
            .from("partituras")
            .upload(ruta, archivoPdf, {
              cacheControl: "3600",
              upsert: true,
              contentType: "application/pdf",
            });

        if (uploadError) {
          console.error(
            "ERROR SUBIENDO PDF:",
            uploadError
          );

          throw new Error(
            `No se pudo subir el PDF: ${uploadError.message}`
          );
        }

        await guardarArchivoPdf(
          partituraId,
          ruta
        );
      }

      router.push(
        `/admin/partituras?success=${
          initialData ? "updated" : "created"
        }`
      );

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
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

      {/* Canción */}
      <div>
        <label className="mb-2 block font-medium">
          Canción
        </label>

        {!initialData && (
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
            Crear una nueva canción
          </label>
        )}

        {crearCancion ? (
          <div className="space-y-3 rounded-lg bg-slate-50 p-4">
            <input
              type="text"
              required
              placeholder="Título de la canción"
              className="w-full rounded border px-3 py-2"
              value={tituloCancion}
              onChange={(event) => setTituloCancion(event.target.value)}
            />
            <input
              type="text"
              placeholder="Compositor (opcional)"
              className="w-full rounded border px-3 py-2"
              value={compositorCancion}
              onChange={(event) => setCompositorCancion(event.target.value)}
            />
            <input
              type="text"
              placeholder="Género (opcional)"
              className="w-full rounded border px-3 py-2"
              value={generoCancion}
              onChange={(event) => setGeneroCancion(event.target.value)}
            />
          </div>
        ) : (
          <select
            required
            disabled={Boolean(initialData)}
            className="w-full rounded border px-3 py-2"
            value={cancionId}
            onChange={(e) => setCancionId(e.target.value)}
          >
            <option value="">Seleccione una canción</option>

            {canciones.map((cancion) => (
              <option key={cancion.id} value={cancion.id}>
                {cancion.titulo}
                {cancion.compositor ? ` — ${cancion.compositor}` : ""}
              </option>
            ))}
          </select>
        )}

        {cancionSeleccionada && (
          <div className="mt-2 rounded bg-slate-50 p-3 text-sm text-slate-600">
            <p>
              <strong>Género:</strong>{" "}
              {cancionSeleccionada.genero ?? "-"}
            </p>

            <p>
              <strong>Compositor:</strong>{" "}
              {cancionSeleccionada.compositor ?? "-"}
            </p>
          </div>
        )}
      </div>

      {/* Instrumento */}
      <div>
        <label className="mb-2 block font-medium">
          Instrumento
        </label>

        <input
          type="text"
          required
          className="w-full rounded border px-3 py-2"
          value={instrumento}
          onChange={(e) =>
            setInstrumento(e.target.value)
          }
          placeholder="Ejemplo: Piano"
        />
      </div>

      {/* Nivel */}
      <div>
        <label className="mb-2 block font-medium">
          Nivel
        </label>

        <select
          className="w-full rounded border px-3 py-2"
          value={nivel}
          onChange={(e) =>
            setNivel(
              e.target.value as NivelPartitura
            )
          }
        >
          <option value="PRINCIPIANTE">
            PRINCIPIANTE
          </option>

          <option value="INTERMEDIO">
            INTERMEDIO
          </option>

          <option value="AVANZADO">
            AVANZADO
          </option>
        </select>
      </div>

      {/* Tonalidad */}
      <div>
        <label className="mb-2 block font-medium">
          Tonalidad
        </label>

        <input
          type="text"
          required
          className="w-full rounded border px-3 py-2"
          value={tonalidad}
          onChange={(e) =>
            setTonalidad(e.target.value)
          }
          placeholder="Ejemplo: Do Mayor, Fa Mayor"
        />

        <p className="mt-1 text-sm text-gray-500">
          Cada canción puede tener varias partituras,
          una por cada tonalidad.
        </p>
      </div>

      {/* PDF */}
      {/* Precio individual */}
      <div>
        <label
          htmlFor="precioIndividual"
          className="mb-2 block font-medium"
        >
          Precio individual (USD)
        </label>

        <input
          id="precioIndividual"
          name="precioIndividual"
          type="number"
          min="0"
          step="0.01"
          required
          className="w-full rounded border px-3 py-2"
          value={precioIndividual}
          onChange={(event) => setPrecioIndividual(event.target.value)}
          placeholder="1.99"
        />

        <p className="mt-1 text-sm text-gray-500">
          Precio que pagará un usuario sin suscripción para descargar esta partitura.
        </p>
      </div>

      {/* PDF */}
      <div className="rounded-lg border border-slate-200 p-5">
        <label className="mb-2 block font-medium">
          Archivo PDF
        </label>

        <input
          type="file"
          accept="application/pdf,.pdf"
          className="block w-full text-sm"
          onChange={(e) =>
            setArchivoPdf(
              e.target.files?.[0] ?? null
            )
          }
        />

        <p className="mt-2 text-sm text-gray-500">
          Formato permitido: PDF. Tamaño máximo: 20 MB.
        </p>

        {archivoPdf && (
          <p className="mt-2 text-sm font-medium text-green-600">
            Archivo seleccionado: {archivoPdf.name}
          </p>
        )}

        {initialData?.archivoPdf && !archivoPdf && (
          <p className="mt-2 text-sm text-slate-500">
            Esta partitura ya tiene un PDF cargado.
          </p>
        )}
      </div>

      {/* Publicación */}
      <div className="rounded border p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={publicada}
            onChange={(e) =>
              setPublicada(e.target.checked)
            }
          />

          <span className="font-medium">
            Publicar partitura
          </span>
        </label>

        <p className="mt-1 text-sm text-gray-500">
          Si está activa, la partitura estará visible
          para los usuarios.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={cargando}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cargando
            ? "Guardando..."
            : initialData
              ? "Actualizar Partitura"
              : "Guardar Partitura"}
        </button>

        <Link
          href="/admin/partituras"
          className="rounded border px-4 py-2 hover:bg-gray-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}