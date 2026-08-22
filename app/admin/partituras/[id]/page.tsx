import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminPartituraDetallePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const partitura = await prisma.partitura.findUnique({
		where: { id },
		include: { cancion: true },
	});

	if (!partitura) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-slate-50 py-10">
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<Link
					href="/admin/partituras"
					className="text-sm font-medium text-slate-500 hover:text-slate-900"
				>
					← Volver a partituras
				</Link>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="text-sm text-slate-500">Canción</p>
							<h1 className="mt-1 text-3xl font-bold text-slate-900">
								{partitura.cancion.titulo}
							</h1>
							<p className="mt-2 text-sm text-slate-500">
								{partitura.cancion.compositor || "Compositor no indicado"}
							</p>
						</div>

						<span className={`rounded-full px-3 py-1 text-xs font-semibold ${partitura.publicada ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
							{partitura.publicada ? "Publicada" : "Oculta"}
						</span>
					</div>

					<dl className="mt-8 grid gap-5 sm:grid-cols-2">
						<div>
							<dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Instrumento</dt>
							<dd className="mt-1 text-slate-700">{partitura.instrumento}</dd>
						</div>
						<div>
							<dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Tonalidad</dt>
							<dd className="mt-1 text-slate-700">{partitura.tonalidad}</dd>
						</div>
						<div>
							<dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nivel</dt>
							<dd className="mt-1 text-slate-700">{partitura.nivel}</dd>
						</div>
						<div>
							<dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Precio individual</dt>
							<dd className="mt-1 text-slate-700">${partitura.precioIndividual.toString()} USD</dd>
						</div>
						<div>
							<dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">PDF</dt>
							<dd className="mt-1 text-slate-700">{partitura.archivoPdf ? "Disponible" : "Pendiente"}</dd>
						</div>
					</dl>

					<div className="mt-8 border-t border-slate-100 pt-5">
						<Link
							href={`/admin/partituras/${partitura.id}/editar`}
							className="inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
						>
							Editar partitura
						</Link>
					</div>
				</section>
			</div>
		</main>
	);
}
