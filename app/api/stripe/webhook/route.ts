import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function estadoSuscripcion(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "ACTIVA" as const;
    case "canceled":
      return "CANCELADA" as const;
    case "past_due":
  case "unpaid":
      return "PAGO_FALLIDO" as const;
    default:
      return "VENCIDA" as const;
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || webhookSecret === "whsec_...") {
    return NextResponse.json(
      { error: "Webhook de Stripe no configurado" },
      { status: 400 }
    );
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("FIRMA DE STRIPE INVÁLIDA:", error);
    return NextResponse.json(
      { error: "Firma inválida" },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const tipo = session.metadata?.tipo;

      if (session.mode === "payment" && tipo === "DESCARGA_INDIVIDUAL") {
        const usuarioId = session.metadata?.usuarioId;
        const partituraId = session.metadata?.partituraId;

        if (!usuarioId || !partituraId) {
          return NextResponse.json({ received: true });
        }

        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id;

        await prisma.pago.upsert({
          where: {
            stripeCheckoutId: session.id,
          },
          update: {
            estado: "APROBADO",
            stripePaymentIntentId: paymentIntentId,
          },
          create: {
            usuarioId,
            partituraId,
            tipo: "DESCARGA_INDIVIDUAL",
            estado: "APROBADO",
            monto: (session.amount_total ?? 0) / 100,
            moneda: (session.currency ?? "usd").toUpperCase(),
            stripeCheckoutId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        });

        return NextResponse.json({ received: true });
      }

      const usuarioId = session.metadata?.usuarioId;
      const planId = session.metadata?.planId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (!usuarioId || !planId || !subscriptionId) {
        return NextResponse.json({ received: true });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const fechaInicio = new Date(subscription.start_date * 1000);
      const fechaFin = new Date(
        (subscription.items.data[0]?.current_period_end ??
          subscription.start_date) * 1000
      );
      const estado = estadoSuscripcion(subscription.status);

      await prisma.$transaction(async (tx) => {
        await tx.suscripcion.updateMany({
          where: {
            usuarioId,
            estado: "ACTIVA",
            stripeSubscriptionId: {
              not: subscriptionId,
            },
          },
          data: {
            estado: "CANCELADA",
          },
        });

        const suscripcion = await tx.suscripcion.upsert({
          where: {
            stripeSubscriptionId: subscriptionId,
          },
          update: {
            planId,
            estado,
            fechaInicio,
            fechaFin,
          },
          create: {
            usuarioId,
            planId,
            estado,
            fechaInicio,
            fechaFin,
            stripeSubscriptionId: subscriptionId,
          },
        });

        await tx.pago.upsert({
          where: {
            stripeCheckoutId: session.id,
          },
          update: {
            estado: "APROBADO",
            suscripcionId: suscripcion.id,
          },
          create: {
            usuarioId,
            suscripcionId: suscripcion.id,
            tipo: "SUSCRIPCION",
            estado: "APROBADO",
            monto: (session.amount_total ?? 0) / 100,
            moneda: (session.currency ?? "usd").toUpperCase(),
            stripeCheckoutId: session.id,
          },
        });
      });
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.suscripcion.updateMany({
        where: {
          stripeSubscriptionId: subscription.id,
        },
        data: {
          estado:
            event.type === "customer.subscription.deleted"
              ? "CANCELADA"
              : estadoSuscripcion(subscription.status),
          fechaFin: new Date(
            (subscription.items.data[0]?.current_period_end ??
              subscription.start_date) * 1000
          ),
        },
      });
    }
  } catch (error) {
    console.error("ERROR PROCESANDO WEBHOOK DE STRIPE:", error);
    return NextResponse.json(
      { error: "No fue posible procesar el evento" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
