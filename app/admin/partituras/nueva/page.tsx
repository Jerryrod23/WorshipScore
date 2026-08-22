import { prisma } from "@/lib/prisma";
import PartituraForm from "@/components/admin/partituras/PartituraForm";

export default async function NuevaPartituraPage() {
  const canciones = await prisma.cancion.findMany({
    orderBy: {
      titulo: "asc",
    },
  });

  return (
    <div className="container mx-auto p-6">

      <h1 className="mb-8 text-3xl font-bold">
        Nueva Partitura
      </h1>

      <PartituraForm
        canciones={canciones}
      />

    </div>
  );
}