import PartituraForm
from "@/components/admin/partituras/PartituraForm";

export default function NuevaPartituraPage() {
  return (
    <div className="container mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">
        Nueva Partitura
      </h1>

      <PartituraForm />

    </div>
  );
}   