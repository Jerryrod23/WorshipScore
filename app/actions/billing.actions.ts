"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

function urlBase() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function seleccionarPlan(formData: FormData) {
  const planId = String(formData.get("planId") ?? "").trim();

  if (!planId) {
    redirect("/planes?mensaje=invalid");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/planes`);
  }

  const usuario = await prisma.usuario.findUnique({
    where: {
      authUserId: user.id,
    },
  });

  if (!usuario || usuario.estado !== "ACTIVO") {
    redirect("/planes?mensaje=unauthorized");
  }

  const plan = await prisma.plan.findFirst({
    where: {
      id: planId,
      activo: true,
    },
  });

  if (!plan) {
    redirect("/planes?mensaje=invalid");
  }

  const priceId = plan.stripePriceId ??
    (plan.intervalo === "MENSUAL"
      ? process.env.STRIPE_MONTHLY_PRICE_ID
      : process.env.STRIPE_YEARLY_PRICE_ID);

  if (!priceId) {
    redirect("/planes?mensaje=not-configured");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: usuario.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      usuarioId: usuario.id,
      planId: plan.id,
    },
    subscription_data: {
      metadata: {
        usuarioId: usuario.id,
        planId: plan.id,
      },
    },
    success_url: `${urlBase()}/planes?mensaje=success`,
    cancel_url: `${urlBase()}/planes?mensaje=cancelled`,
  });

  if (!session.url) {
    redirect("/planes?mensaje=checkout-error");
  }

  redirect(session.url);
}

export async function comprarDescarga(formData: FormData) {
  const partituraId = String(formData.get("partituraId") ?? "").trim();

  if (!partituraId) {
    return { success: false, message: "La partitura seleccionada no es válida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Debes iniciar sesión para comprar esta descarga." };
  }

  const [usuario, partitura] = await Promise.all([
    prisma.usuario.findUnique({ where: { authUserId: user.id } }),
    prisma.partitura.findFirst({
      where: { id: partituraId, publicada: true },
    }),
  ]);

  if (!usuario || usuario.estado !== "ACTIVO" || !partitura) {
    return { success: false, message: "No fue posible preparar esta compra." };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: usuario.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Descarga de partitura",
          },
          unit_amount: Math.round(Number(partitura.precioIndividual) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      tipo: "DESCARGA_INDIVIDUAL",
      usuarioId: usuario.id,
      partituraId: partitura.id,
    },
    success_url: `${urlBase()}/partituras/${partitura.id}?mensaje=paid`,
    cancel_url: `${urlBase()}/partituras/${partitura.id}?mensaje=cancelled`,
  });

  return {
    success: true,
    url: session.url,
  };
}
