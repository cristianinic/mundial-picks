import Link from "next/link";

export default function PagoPendingPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#020617", color: "white", fontFamily: "Arial", textAlign: "center", padding: 24 }}>
      <div>
        <h1>Pago pendiente</h1>
        <p>Tu pago está en revisión. Cuando se confirme, activaremos tu acceso.</p>
        <Link href="/" style={{ color: "#fbbf24" }}>Volver al inicio</Link>
      </div>
    </main>
  );
}