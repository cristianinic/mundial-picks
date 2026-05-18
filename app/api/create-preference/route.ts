import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userEmail = body?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Falta el email del usuario" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Falta NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      );
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: "mundial-picks-inscripcion",
            title: "Inscripción Mundial Picks 2026",
            description:
              "Acceso digital para crear predicciones, ranking y datos formidables.",
            quantity: 1,
            currency_id: "MXN",
            unit_price: 99,
          },
        ],

        external_reference: userEmail,

        metadata: {
          user_email: userEmail,
          product: "mundial-picks-2026",
        },

        back_urls: {
          success: `${siteUrl}/pago/success`,
          failure: `${siteUrl}/pago/failure`,
          pending: `${siteUrl}/pago/pending`,
        },

        auto_return: "approved",

       notification_url: `${siteUrl}/api/webhook`,
      },
    });

    return NextResponse.json({
      init_point: result.init_point,
    });
  } catch (error) {
    console.error("Error creando preferencia:", error);

    return NextResponse.json(
      { error: "No se pudo crear la preferencia de pago" },
      { status: 500 }
    );
  }
}