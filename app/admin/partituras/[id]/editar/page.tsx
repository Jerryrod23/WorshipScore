import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PartituraForm from "@/components/admin/partituras/PartituraForm";

export default async function EditarPartituraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const partitura = await prisma.partitura.findUnique({
    where: {
      id,
    },
  });

  if (!partitura) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">

      <h1 className="text-3xl font-bold mb-6">
        Editar Partitura
      </h1>

      <PartituraForm
        initialData={partitura}
      />

    </div>
  );
}