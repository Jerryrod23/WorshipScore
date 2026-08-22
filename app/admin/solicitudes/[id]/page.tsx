import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

type Props = {
	params: Promise<{
		id: string;
	}>;
	searchParams: Promise<{
		q?: string;
		mensaje?: string;
	}>;
};

function estadoTexto(estado: string) {
	switch (estado) {
		case "PENDIENTE":
			return "Pendiente";
		case "EN_PROCESO":
			return "En proceso";
		case "COMPLETADA":
			return "Completada";
		case "RECHAZADA":
			return "Rechazada";
		default:
			return estado;
	}
}

function estadoClase(estado: string) {
	switch (estado) {
		case "PENDIENTE":
			return "bg-yellow-100 text-yellow-800";
		case "EN_PROCESO":
			return "bg-blue-100 text-blue-800";
		case "COMPLETADA":
			return "bg-green-100 text-green-800";
		case "RECHAZADA":
			return "bg-red-100 text-red-800";
		default:
			return "bg-slate-100 text-slate-700";
	}
}

function textoFormulario(formData: FormData, nombre: string) {
	return String(formData.get(nombre) ?? "").trim();
}

async function gestionarSolicitud(formData: FormData) {
	"use server";

	await requireAdmin();

	const solicitudId = textoFormulario(formData, "solicitudId");
	const accion = textoFormulario(formData, "accion");
	const partituraId = textoFormulario(formData, "partituraId");

	if (!solicitudId) {
		redirect("/admin/solicitudes?mensaje=invalid");
	}

	const solicitud = await prisma.solicitudPartitura.findUnique({
		where: {
			id: solicitudId,
		},
	});

	if (!solicitud) {
		redirect("/admin/solicitudes?mensaje=not-found");
	}

	if (accion === "iniciar") {
		if (solicitud.estado !== "PENDIENTE") {
			redirect(`/admin/solicitudes/${solicitudId}?mensaje=invalid-transition`);
		}

		await prisma.$transaction([
			prisma.solicitudPartitura.update({
				where: {
					id: solicitudId,
				},
				data: {
					estado: "EN_PROCESO",
				},
			}),
			prisma.notificacion.create({
				data: {
					usuarioId: solicitud.usuarioId,
					solicitudId,
					titulo: "Solicitud en proceso",
					mensaje: `Tu solicitud de "${solicitud.titulo}" está siendo atendida.`,
				},
			}),
		]);

		revalidatePath(`/admin/solicitudes/${solicitudId}`);
		revalidatePath("/admin/solicitudes");
		revalidatePath("/solicitudes");
		redirect(`/admin/solicitudes/${solicitudId}?mensaje=in-progress`);
	}

	if (accion === "rechazar") {
		if (solicitud.estado === "COMPLETADA") {
			redirect(`/admin/solicitudes/${solicitudId}?mensaje=invalid-transition`);
		}

		await prisma.$transaction([
			prisma.solicitudPartitura.update({
				where: {
					id: solicitudId,
				},
				data: {
					estado: "RECHAZADA",
					partituraId: null,
				},
			}),
			prisma.notificacion.create({
				data: {
					usuarioId: solicitud.usuarioId,
					solicitudId,
					titulo: "Solicitud rechazada",
					mensaje: `No fue posible atender tu solicitud de "${solicitud.titulo}".`,
				},
			}),
		]);

		revalidatePath(`/admin/solicitudes/${solicitudId}`);
		revalidatePath("/admin/solicitudes");
		revalidatePath("/solicitudes");
		redirect(`/admin/solicitudes/${solicitudId}?mensaje=rejected`);
	}

	if (accion !== "asociar" && accion !== "completar") {
		redirect(`/admin/solicitudes/${solicitudId}?mensaje=invalid-action`);
	}

	if (!partituraId) {
		redirect(`/admin/solicitudes/${solicitudId}?mensaje=missing-score`);
	}

	if (solicitud.estado === "RECHAZADA") {
		redirect(`/admin/solicitudes/${solicitudId}?mensaje=invalid-transition`);
	}

	const partitura = await prisma.partitura.findFirst({
		where: {
			id: partituraId,
			cancionId: solicitud.cancionId,
			publicada: true,
		},
	});

	if (!partitura) {
		redirect(`/admin/solicitudes/${solicitudId}?mensaje=invalid-score`);
	}

	if (
		solicitud.tonalidadSolicitada &&
		partitura.tonalidad !== solicitud.tonalidadSolicitada
	) {
		redirect(`/admin/solicitudes/${solicitudId}?mensaje=wrong-key`);
	}

	const nuevoEstado = accion === "completar" ? "COMPLETADA" : "EN_PROCESO";
	const notificacion = accion === "completar"
		? {
				titulo: "Solicitud completada",
				mensaje: `Tu solicitud de "${solicitud.titulo}" ya está disponible.`,
			}
		: {
				titulo: "Solicitud en proceso",
				mensaje: `Tu solicitud de "${solicitud.titulo}" está siendo atendida.`,
			};

	if (solicitud.estado !== nuevoEstado) {
		await prisma.$transaction([
			prisma.solicitudPartitura.update({
				where: {
					id: solicitudId,
				},
				data: {
					partituraId: partitura.id,
					estado: nuevoEstado,
				},
			}),
			prisma.notificacion.create({
				data: {
					usuarioId: solicitud.usuarioId,
					solicitudId,
					titulo: notificacion.titulo,
					mensaje: notificacion.mensaje,
				},
			}),
		]);
	} else {
		await prisma.solicitudPartitura.update({
			where: {
				id: solicitudId,
			},
			data: {
				partituraId: partitura.id,
				estado: nuevoEstado,
			},
		});
	}

	revalidatePath(`/admin/solicitudes/${solicitudId}`);
	revalidatePath("/admin/solicitudes");
	revalidatePath("/solicitudes");
	redirect(
		`/admin/solicitudes/${solicitudId}?mensaje=${
			accion === "completar" ? "completed" : "associated"
		}`
	);
}

function mensajeTexto(mensaje?: string) {
	switch (mensaje) {
		case "in-progress":
			return "La solicitud pasó a estado En proceso.";
		case "associated":
			return "La partitura fue asociada a la solicitud.";
		case "completed":
			return "La solicitud fue completada correctamente.";
		case "rejected":
			return "La solicitud fue rechazada.";
		case "missing-score":
			return "Selecciona una partitura antes de continuar.";
		case "invalid-score":
			return "La partitura seleccionada no pertenece a esta canción o no está publicada.";
		case "wrong-key":
			return "La partitura seleccionada no coincide con la tonalidad solicitada.";
		case "invalid-transition":
			return "La solicitud no puede pasar a ese estado desde su estado actual.";
		case "invalid-action":
			return "La operación solicitada no es válida.";
		default:
			return undefined;
	}
}

export default async function AdminSolicitudDetallePage({
	params,
	searchParams,
}: Props) {
	const { id } = await params;
	const { q, mensaje } = await searchParams;
	const busqueda = q?.trim() ?? "";
	const nivelesValidos = [
		"PRINCIPIANTE",
		"INTERMEDIO",
		"AVANZADO",
	] as const;
	const nivelBuscado = busqueda.toUpperCase();

	const solicitud = await prisma.solicitudPartitura.findUnique({
		where: {
			id,
		},
		include: {
			usuario: true,
			cancion: true,
			partitura: true,
		},
	});

	if (!solicitud) {
		notFound();
	}

	const partituras = await prisma.partitura.findMany({
		where: {
			cancionId: solicitud.cancionId,
			publicada: true,
			...(busqueda
				? {
						OR: [
							{
								instrumento: {
									contains: busqueda,
									mode: "insensitive",
								},
							},
							{
								tonalidad: {
									contains: busqueda,
									mode: "insensitive",
								},
							},
							...(nivelesValidos.includes(
								nivelBuscado as (typeof nivelesValidos)[number]
							)
								? [
										{
											nivel: {
												equals: nivelBuscado as (typeof nivelesValidos)[number],
											},
										},
									]
								: []),
						],
					}
				: {}),
		},
		orderBy: [
			{
				tonalidad: "asc",
			},
			{
				instrumento: "asc",
			},
		],
	});

	const mensajeVisible = mensajeTexto(mensaje);
	const puedeGestionar =
		solicitud.estado !== "COMPLETADA" &&
		solicitud.estado !== "RECHAZADA";

	return (
		<main className="min-h-screen bg-slate-50 py-10">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<Link
							href="/admin/solicitudes"
							className="text-sm font-medium text-slate-500 hover:text-slate-900"
						>
							← Volver a solicitudes
						</Link>
						<h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
							Detalle de solicitud
						</h1>
						<p className="mt-2 text-sm text-slate-500">
							Conecta la solicitud con una partitura publicada de la misma canción.
						</p>
					</div>

					<span
						className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-semibold ${estadoClase(
							solicitud.estado
						)}`}
					>
						{estadoTexto(solicitud.estado)}
					</span>
				</div>

				{mensajeVisible && (
					<div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
						{mensajeVisible}
					</div>
				)}

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
					<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">
							Datos de la solicitud
						</h2>

						<dl className="mt-6 space-y-4 text-sm">
							<div>
								<dt className="font-medium text-slate-500">Canción</dt>
								<dd className="mt-1 text-base font-semibold text-slate-900">
									{solicitud.cancion.titulo}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-slate-500">Compositor</dt>
								<dd className="mt-1 text-slate-700">
									{solicitud.compositor || solicitud.cancion.compositor || "-"}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-slate-500">Usuario</dt>
								<dd className="mt-1 text-slate-700">
									{solicitud.usuario.nombre} ({solicitud.usuario.email})
								</dd>
							</div>
							<div>
								<dt className="font-medium text-slate-500">Instrumento</dt>
								<dd className="mt-1 text-slate-700">
									{solicitud.instrumento || "-"}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-slate-500">Tonalidad solicitada</dt>
								<dd className="mt-1 font-semibold text-blue-700">
									{solicitud.tonalidadSolicitada || "Cualquier tonalidad"}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-slate-500">Fecha</dt>
								<dd className="mt-1 text-slate-700">
									{solicitud.fechaSolicitud.toLocaleDateString("es-DO")}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-slate-500">Descripción</dt>
								<dd className="mt-1 whitespace-pre-wrap text-slate-700">
									{solicitud.descripcion || "-"}
								</dd>
							</div>
							<div>
								<dt className="font-medium text-slate-500">Comentarios</dt>
								<dd className="mt-1 whitespace-pre-wrap text-slate-700">
									{solicitud.comentarios || "-"}
								</dd>
							</div>
						</dl>
					</section>

					<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold text-slate-900">
							Partitura de la misma canción
						</h2>
						<p className="mt-2 text-sm text-slate-500">
							Solo se muestran partituras publicadas de {solicitud.cancion.titulo}.
							La tonalidad debe coincidir para poder asociarla.
						</p>

						<form
							method="get"
							className="mt-6 flex flex-col gap-3 sm:flex-row"
						>
							<label htmlFor="q" className="sr-only">
								Buscar partitura
							</label>
							<input
								id="q"
								name="q"
								defaultValue={busqueda}
								placeholder="Instrumento, tonalidad o nivel"
								className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
							/>
							<button
								type="submit"
								className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
							>
								Buscar
							</button>
							{busqueda && (
								<Link
									href={`/admin/solicitudes/${id}`}
									className="rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
								>
									Limpiar
								</Link>
							)}
						</form>

						<div className="mt-5 space-y-3">
							{partituras.length === 0 ? (
								<p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
									No hay partituras publicadas que coincidan con la búsqueda.
								</p>
							) : (
								partituras.map((partitura) => {
									const coincideTonalidad =
										!solicitud.tonalidadSolicitada ||
										partitura.tonalidad === solicitud.tonalidadSolicitada;
									const estaAsociada = solicitud.partituraId === partitura.id;

									return (
										<div
											key={partitura.id}
											className={`rounded-lg border p-4 ${
												estaAsociada
													? "border-green-300 bg-green-50"
													: "border-slate-200"
											}`}
										>
											<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
												<div>
													<p className="font-semibold text-slate-900">
														{partitura.instrumento}
													</p>
													<p className="mt-1 text-sm text-slate-600">
														{partitura.tonalidad} · {partitura.nivel}
													</p>
													{!coincideTonalidad && (
														<p className="mt-2 text-xs font-medium text-amber-700">
															No coincide con la tonalidad solicitada.
														</p>
													)}
													{estaAsociada && (
														<p className="mt-2 text-xs font-semibold text-green-700">
															Partitura asociada actualmente.
														</p>
													)}
												</div>

												{puedeGestionar && coincideTonalidad && (
													<form action={gestionarSolicitud}>
														<input
															type="hidden"
															name="solicitudId"
															value={solicitud.id}
														/>
														<input
															type="hidden"
															name="partituraId"
															value={partitura.id}
														/>
														<button
															type="submit"
															name="accion"
															value="asociar"
															className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
														>
															{estaAsociada ? "Asociada" : "Asociar"}
														</button>
													</form>
												)}
											</div>
										</div>
									);
								})
							)}
						</div>
					</section>
				</div>

				<section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-slate-900">Gestionar estado</h2>
					<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
						{solicitud.estado === "PENDIENTE" && (
							<form action={gestionarSolicitud}>
								<input type="hidden" name="solicitudId" value={solicitud.id} />
								<button
									type="submit"
									name="accion"
									value="iniciar"
									className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
								>
									Pasar a En proceso
								</button>
							</form>
						)}

						{puedeGestionar && solicitud.partituraId && (
							<form action={gestionarSolicitud}>
								<input type="hidden" name="solicitudId" value={solicitud.id} />
								<input
									type="hidden"
									name="partituraId"
									value={solicitud.partituraId}
								/>
								<button
									type="submit"
									name="accion"
									value="completar"
									className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 sm:w-auto"
								>
									Marcar como completada
								</button>
							</form>
						)}

						{puedeGestionar && (
							<form action={gestionarSolicitud}>
								<input type="hidden" name="solicitudId" value={solicitud.id} />
								<button
									type="submit"
									name="accion"
									value="rechazar"
									className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 sm:w-auto"
								>
									Rechazar solicitud
								</button>
							</form>
						)}

						{!puedeGestionar && (
							<p className="text-sm text-slate-500">
								Esta solicitud ya tiene un estado final y no admite más cambios.
							</p>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
