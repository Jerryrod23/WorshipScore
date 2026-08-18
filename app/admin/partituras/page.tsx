import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AlertaTemporal from "@/components/admin/AlertaTemporal";

export default async function AdminPartiturasPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
  }>;
}) {
  const params = await searchParams;

  const mensaje = params.success; 
 

  const partituras = await prisma.partitura.findMany({
    orderBy: {
      fechaCreacion: "desc",
    },
  });

  return (
    <div className="container mx-auto p-6">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            Gestión de Partituras
          </h1>

          <p className="text-muted-foreground">
            Total: {partituras.length}
          </p>
        </div>
        <Link href="/admin/partituras/nueva">        
          Nueva Partitura
        </Link>

      </div>

      {mensaje === "updated" && (
            <AlertaTemporal
              mensaje="✅ Partitura actualizada correctamente"
            />
          )}

        {mensaje === "created" && (
          <AlertaTemporal
            mensaje="✅ Partitura creada correctamente"
          />
        )}

      <div className="rounded-lg border overflow-hidden">

        

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Compositor</th>
              <th className="text-left p-3">Instrumento</th>
              <th className="text-left p-3">Género</th>
              <th className="text-left p-3">Nivel</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-right p-3">Acciones</th>
            </tr>

          </thead>

          <tbody>

            {partituras.map((partitura) => (

              <tr
                key={partitura.id}
                className="border-t"
              >

                <td className="p-3 font-medium">
                  {partitura.titulo}
                </td>

                <td className="p-3">
                  {partitura.compositor || "-"}
                </td>

                <td className="p-3">
                  {partitura.instrumento}
                </td>

                <td className="p-3">
                  {partitura.genero}
                </td>

                <td className="p-3">
                  {partitura.nivel}
                </td>

                <td className="p-3">
                  {partitura.publicada
                    ? "Publicada"
                    : "Oculta"}
                </td>

                <td className="p-3">

                  <div className="flex justify-end gap-2">
                  <Link href= {`/partituras/${partitura.id}`}> 
                      Ver
                    </Link>
            <Link href= {`/admin/partituras/${partitura.id}/editar`}>
                      Editar
                    </Link>

                    <button
                      className="border px-3 py-1 rounded text-red-600"
                    >
                      Eliminar
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
