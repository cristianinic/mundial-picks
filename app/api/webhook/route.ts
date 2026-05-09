import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function activarPago(paymentId: string) {
  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
    }
  );

  const payment = await res.json();

  console.log("Pago recibido:", payment);

  if (payment.status !== "approved") {
    return { ok: true, message: "Pago todavía no aprobado" };
  }

  const email =
    payment.metadata?.user_email ||
    payment.external_reference ||
    payment.payer?.email;

  if (!email) {
    console.error("No se encontró email en Mercado Pago:", payment);
    return { ok: false, message: "No se encontró email del usuario" };
  }

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ has_paid: true })
    .eq("email", email)
    .select();

  if (error) {
    console.error("Error actualizando Supabase:", error);
    return { ok: false, message: "Error actualizando Supabase", error };
  }

  if (!data || data.length === 0) {
    console.error("No se encontró usuario con email:", email);
    return { ok: false, message: "Usuario no encontrado", email };
  }

  console.log("Usuario activado correctamente:", data);

  return { ok: true, activatedEmail: email };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.resource?.split("/").pop();

    if (!paymentId) {
      return NextResponse.json({ ok: true, message: "Sin paymentId" });
    }

    const result = await activarPago(String(paymentId));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Webhook POST error:", error);
    return NextResponse.json({ ok: false, error: true }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const paymentId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      url.searchParams.get("payment_id");

    if (!paymentId) {
      return NextResponse.json({ ok: true, message: "Sin paymentId" });
    }

    const result = await activarPago(paymentId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Webhook GET error:", error);
    return NextResponse.json({ ok: false, error: true }, { status: 500 });
  }
}