"use client";

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

type PartituraFormProps = {
  initialData?: {
    id: string;
    titulo: string;
    compositor: string | null;
    descripcion: string | null;
    instrumento: string;
    genero: string;
    nivel: NivelPartitura;
    tonalidad: string | null;
    publicada: boolean;
  };
};

export default function PartituraForm({
  initialData,
}: PartituraFormProps) {
  const [titulo, setTitulo] = useState(
    initialData?.titulo ?? ""
  );

  const [compositor, setCompositor] = useState(
    initialData?.compositor ?? ""
  );

  const [descripcion, setDescripcion] = useState(
    initialData?.descripcion ?? ""
  );

  const [instrumento, setInstrumento] = useState(
    initialData?.instrumento ?? ""
  );

  const [genero, setGenero] = useState(
    initialData?.genero ?? ""
  );

  const [nivel, setNivel] = useState<NivelPartitura>(
    initialData?.nivel ?? "INTERMEDIO"
  );

  const [tonalidad, setTonalidad] = useState(
    initialData?.tonalidad ?? ""
  );

  const [publicada, setPublicada] = useState(
    initialData?.publicada ?? true
  );

  const [archivoPdf, setArchivoPdf] =
    useState<File | null>(null);

  const [cargando, setCargando] = useState(false);

  const [error, setError] = useState("");

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

      formData.append("titulo", titulo);
      formData.append("compositor", compositor);
      formData.append("descripcion", descripcion);
      formData.append("instrumento", instrumento);
      formData.append("genero", genero);
      formData.append("nivel", nivel);
      formData.append("tonalidad", tonalidad);
      formData.append(
        "publicada",
        publicada ? "true" : "false"
      );

      // Crear o actualizar la partitura
      const resultado = await guardarPartitura(formData);

      if (!resultado?.success) {
        throw new Error(
          resultado?.message ??
            "No fue posible guardar la partitura."
        );
      }

      // En edición no necesitamos crear nuevamente la partitura.
      const partituraId =
        initialData?.id ?? resultado.id;

      // Subir PDF si el administrador seleccionó uno
      if (archivoPdf) {
        if (archivoPdf.type !== "application/pdf") {
          throw new Error(
            "El archivo seleccionado debe ser un PDF."
          );
        }

        // Límite de 20 MB
        const maxSize = 20 * 1024 * 1024;

        if (archivoPdf.size > maxSize) {
          throw new Error(
            "El PDF no puede superar los 20 MB."
          );
        }

        const supabase = createClient();

        const extension = "pdf";

        const ruta = `${partituraId}/partitura.${extension}`;

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

        // Guardar la ruta en PostgreSQL
        await guardarArchivoPdf(
          partituraId!,
          ruta
        );
      }

      window.location.href =
        `/admin/partituras?success=${
          initialData ? "updated" : "created"
        }`;
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

      <div>
        <label className="mb-2 block font-medium">
          Título
        </label>

        <input
          type="text"
          required
          className="w-full rounded border px-3 py-2"
          value={titulo}
          onChange={(e) =>
            setTitulo(e.target.value)
          }
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Compositor
        </label>

        <input
          type="text"
          className="w-full rounded border px-3 py-2"
          value={compositor}
          onChange={(e) =>
            setCompositor(e.target.value)
          }
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Descripción
        </label>

        <textarea
          rows={4}
          className="w-full rounded border px-3 py-2"
          value={descripcion}
          onChange={(e) =>
            setDescripcion(e.target.value)
          }
        />
      </div>

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
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Género
        </label>

        <input
          type="text"
          required
          className="w-full rounded border px-3 py-2"
          value={genero}
          onChange={(e) =>
            setGenero(e.target.value)
          }
        />
      </div>

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

      <div>
        <label className="mb-2 block font-medium">
          Tonalidad
        </label>

        <input
          type="text"
          className="w-full rounded border px-3 py-2"
          value={tonalidad}
          onChange={(e) =>
            setTonalidad(e.target.value)
          }
          placeholder="Ejemplo: Do Mayor, La menor"
        />
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

        <a
          href="/admin/partituras"
          className="rounded border px-4 py-2 hover:bg-gray-100"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}