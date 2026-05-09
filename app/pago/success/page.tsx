import Link from "next/link";

export default function PagoSuccessPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#020617",
        color: "white",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <h1>Pago recibido</h1>
        <p>
          Estamos confirmando tu inscripción. Si el pago fue aprobado, tu acceso
          se activará automáticamente en unos momentos.
        </p>

        <Link href="/" style={{ color: "#fbbf24", fontWeight: 700 }}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}