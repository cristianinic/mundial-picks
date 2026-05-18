import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

function createPublicId() {
  return `#${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Falta el email" }, { status: 400 });
    }

    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from("users")
      .select("email, public_id, has_paid")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      console.error("Error revisando usuario:", existingError);
      return NextResponse.json(
        { error: "No se pudo revisar el usuario" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json({ ok: true, user: existingUser });
    }

    for (let i = 0; i < 8; i++) {
      const publicId = createPublicId();

      const { data, error } = await supabaseAdmin
        .from("users")
        .insert({
          email,
          username: email,
          public_id: publicId,
          country: "MX",
          points: 0,
          has_paid: false,
          prediction_locked: false,
        })
        .select("email, public_id, has_paid")
        .single();

      if (!error && data) {
        return NextResponse.json({ ok: true, user: data });
      }

      const isDuplicatePublicId =
        error?.code === "23505" &&
        String(error?.message || "").includes("public_id");

      if (!isDuplicatePublicId) {
        console.error("Error creando perfil:", error);
        return NextResponse.json(
          { error: "No se pudo crear el perfil" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "No se pudo generar un ID único" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      { error: "Error creando perfil" },
      { status: 500 }
    );
  }
}