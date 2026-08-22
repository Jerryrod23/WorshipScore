import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PartituraForm from "@/components/admin/partituras/PartituraForm";

export default async function EditarPartituraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [partitura, canciones] =
    await Promise.all([
      prisma.partitura.findUnique({
        where: {
          id,
        },
      }),

      prisma.cancion.findMany({
        orderBy: {
          titulo: "asc",
        },
      }),
    ]);

  if (!partitura) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">

      <h1 className="mb-6 text-3xl font-bold">
        Editar Partitura
      </h1>

      <PartituraForm
        canciones={canciones}
        initialData={{
          id: partitura.id,
          cancionId: partitura.cancionId,
          instrumento: partitura.instrumento,
          nivel: partitura.nivel,
          tonalidad: partitura.tonalidad,
          publicada: partitura.publicada,
          archivoPdf: partitura.archivoPdf,
        }}
      />

    </div>
  );
} 