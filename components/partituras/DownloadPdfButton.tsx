"use client";

import { useState } from "react";
import { descargarPartitura } from "@/app/actions/descarga.actions";

type Props = {
  partituraId: string;
};

export default function DownloadPdfButton({
  partituraId,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setError("");
    setCargando(true);

    try {
      const resultado = await descargarPartitura(partituraId);

      if (!resultado.success) {
        setError(resultado.message);
        return;
      }

      // Abrir el PDF
      window.open(
        resultado.url,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error(error);

      setError(
        "No fue posible descargar la partitura."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={cargando}
        className="block w-full rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando
          ? "Preparando descarga..."
          : "Descargar PDF"}
      </button>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}